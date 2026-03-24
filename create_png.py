import base64, pathlib
path = pathlib.Path('tmp/test.png')
data = b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAoMBgP+iG4cAAAAASUVORK5CYII='
path.write_bytes(base64.b64decode(data))
