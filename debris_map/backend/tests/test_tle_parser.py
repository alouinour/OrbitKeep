from app.services.tle_parser import parse_tle_to_object

ISS_LINE1 = "1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9007"
ISS_LINE2 = "2 25544  51.6400 208.9163 0006317  69.9862  25.2906 15.50377579430271"


def test_parse_tle_returns_valid_geodetic_coordinates():
    obj = parse_tle_to_object("sat-test", "ISS (ZARYA)", ISS_LINE1, ISS_LINE2, "satellite")

    assert obj is not None
    assert -90 <= obj.lat <= 90
    assert -180 <= obj.lon <= 180
    assert 300 <= obj.altitude <= 500  # orbite ISS typique


def test_parse_tle_returns_none_on_invalid_lines():
    obj = parse_tle_to_object("bad", "INVALID", "not a valid line", "still not valid", "satellite")

    assert obj is None