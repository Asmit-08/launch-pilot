from urllib.parse import urljoin, urlparse
import ipaddress
import socket

import httpx
from bs4 import BeautifulSoup


MAX_HTML_SIZE = 2_000_000
REQUEST_TIMEOUT = 10.0
MAX_REDIRECTS = 5


def _is_private_or_internal_host(hostname: str) -> bool:
    """
    Prevent SSRF by rejecting localhost, private IPs,
    loopback, link-local, multicast, reserved,
    and unspecified addresses.
    """

    if not hostname:
        return True

    hostname = hostname.lower().rstrip(".")

    blocked_hostnames = {
        "localhost",
        "localhost.localdomain",
        "ip6-localhost",
        "ip6-loopback",
    }

    if hostname in blocked_hostnames:
        return True

    try:
        addresses = socket.getaddrinfo(
            hostname,
            None,
            type=socket.SOCK_STREAM,
        )

        if not addresses:
            return True

        for address in addresses:
            ip = ipaddress.ip_address(address[4][0])

            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_multicast
                or ip.is_reserved
                or ip.is_unspecified
            ):
                return True

    except (socket.gaierror, ValueError):
        return True

    return False


def _validate_url(url: str) -> str:
    """
    Validate a URL before making a request.
    """

    url = url.strip()

    parsed = urlparse(url)

    if parsed.scheme not in {"http", "https"}:
        raise ValueError(
            "Only HTTP and HTTPS URLs are supported."
        )

    if not parsed.hostname:
        raise ValueError(
            "Invalid landing page URL."
        )

    if _is_private_or_internal_host(
        parsed.hostname
    ):
        raise ValueError(
            "This URL cannot be accessed."
        )

    return url


def _extract_page_content(
    html: str,
    url: str,
) -> dict:
    """
    Extract useful landing-page information from HTML.
    """

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    # Remove content that is not useful for analysis.
    for element in soup(
        [
            "script",
            "style",
            "noscript",
            "svg",
            "iframe",
        ]
    ):
        element.decompose()

    # ---------------------------------------------------------
    # Title
    # ---------------------------------------------------------

    title = ""

    if soup.title:
        title = soup.title.get_text(
            " ",
            strip=True,
        )

    # ---------------------------------------------------------
    # Headings
    # ---------------------------------------------------------

    headings = []

    for heading in soup.find_all(
        ["h1", "h2", "h3"]
    ):
        text = heading.get_text(
            " ",
            strip=True,
        )

        if text:
            headings.append(text)

    # ---------------------------------------------------------
    # Remove common navigation / structural elements
    # ---------------------------------------------------------

    for element in soup.find_all(
        [
            "nav",
            "footer",
            "header",
            "aside",
        ]
    ):
        element.decompose()

    # ---------------------------------------------------------
    # Visible text
    # ---------------------------------------------------------

    text = soup.get_text(
        " ",
        strip=True,
    )

    # Normalize excessive whitespace.
    text = " ".join(text.split())

    # Keep the extracted text within our analysis limit.
    if len(text) > MAX_HTML_SIZE:
        text = text[:MAX_HTML_SIZE]

    return {
        "url": url,
        "title": title,
        "headings": headings[:50],
        "text": text,
    }


def _read_html_response(
    response: httpx.Response,
) -> str:
    """
    Read an HTML response while enforcing the maximum
    response size.
    """

    content_length = response.headers.get(
        "content-length"
    )

    if content_length:
        try:
            content_length_value = int(
                content_length
            )
        except ValueError:
            content_length_value = 0

        if content_length_value > MAX_HTML_SIZE:
            raise ValueError(
                "The landing page is too large to analyze."
            )

    chunks = []
    total_size = 0

    for chunk in response.iter_bytes():

        total_size += len(chunk)

        if total_size > MAX_HTML_SIZE:
            raise ValueError(
                "The landing page is too large to analyze."
            )

        chunks.append(chunk)

    return b"".join(chunks).decode(
        response.encoding or "utf-8",
        errors="replace",
    )


def fetch_landing_page(url: str) -> dict:
    """
    Safely fetch and extract useful content
    from a landing page.

    Redirects are handled manually so that every
    redirect destination is validated before it
    is requested.
    """

    current_url = _validate_url(url)

    headers = {
        "User-Agent": (
            "Mozilla/5.0 "
            "(compatible; LaunchPilot/1.0; "
            "+https://launch-pilot-flax.vercel.app)"
        )
    }

    try:
        with httpx.Client(
            timeout=REQUEST_TIMEOUT,
            follow_redirects=False,
            headers=headers,
        ) as client:

            for redirect_count in range(
                MAX_REDIRECTS + 1
            ):

                with client.stream(
                    "GET",
                    current_url,
                ) as response:

                    # -------------------------------------------------
                    # Handle redirects manually.
                    # -------------------------------------------------

                    if response.status_code in {
                        301,
                        302,
                        303,
                        307,
                        308,
                    }:

                        location = response.headers.get(
                            "location"
                        )

                        if not location:
                            raise ValueError(
                                "Landing page returned a redirect "
                                "without a destination."
                            )

                        if redirect_count >= MAX_REDIRECTS:
                            raise ValueError(
                                "Too many redirects."
                            )

                        # Handle relative redirects correctly.
                        next_url = urljoin(
                            current_url,
                            location,
                        )

                        # IMPORTANT:
                        # Validate the redirect BEFORE requesting it.
                        current_url = _validate_url(
                            next_url
                        )

                        continue

                    # -------------------------------------------------
                    # Handle HTTP errors.
                    # -------------------------------------------------

                    print(
                            "LANDING PAGE RESPONSE:",
                            response.status_code,
                            dict(response.headers),
                        )

                    if response.status_code >= 400:
                        raise ValueError(
                            "Landing page returned HTTP "
                            f"{response.status_code}."
                        )

                    # -------------------------------------------------
                    # Verify content type.
                    # -------------------------------------------------

                    content_type = response.headers.get(
                        "content-type",
                        "",
                    ).lower()

                    if "text/html" not in content_type:
                        raise ValueError(
                            "The provided URL does not return "
                            "an HTML page."
                        )

                    # -------------------------------------------------
                    # Read HTML with size protection.
                    # -------------------------------------------------

                    html = _read_html_response(
                        response
                    )

                    # -------------------------------------------------
                    # Final URL has already been validated before
                    # the request, so it is safe to return.
                    # -------------------------------------------------

                    return _extract_page_content(
                        html,
                        current_url,
                    )

            raise ValueError(
                "Unable to reach the landing page."
            )

    except ValueError:
        # Preserve our intentional validation errors.
        raise

    except httpx.TimeoutException:
        raise ValueError(
            "The landing page took too long to respond."
        )

    except httpx.RequestError:
        raise ValueError(
            "Unable to reach the landing page."
        )