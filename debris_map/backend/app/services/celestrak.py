import httpx

CELESTRAK_BASE_URL = "https://celestrak.org/NORAD/elements/gp.php"


async def fetch_tle(group: str) -> list[tuple[str, str, str]]:
    """Fetch raw TLE data for a CelesTrak group.
    Returns a list of (name, line1, line2) tuples."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            CELESTRAK_BASE_URL, params={"GROUP": group, "FORMAT": "tle"}
        )
        response.raise_for_status()

    lines = [line.strip() for line in response.text.splitlines() if line.strip()]
    entries: list[tuple[str, str, str]] = []
    for i in range(0, len(lines) - 2, 3):
        name, line1, line2 = lines[i], lines[i + 1], lines[i + 2]
        entries.append((name, line1, line2))
    return entries