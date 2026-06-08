#!/usr/bin/env python3
"""
step2glb.py — STEP → GLB для 3D-в'юера сайту.
Конвертує (cascadio) і перефарбовує модель у фірмовий темно-сірий
(baseColor [0.235,0.243,0.267], metallic 0.45, rough 0.5), як решта моделей.

tol_linear — лінійна девіація тесселяції: більше = грубіше = легший GLB.
Для важких збірок (BOX-II/III) піднімаємо tol, щоб GLB лишався ~15-20 МБ.

  python3 step2glb.py <input.step> <output.glb> [tol_linear=0.05] [tol_angular=0.5]
"""
import sys, json, struct
import cascadio

DARK = [0.23529412, 0.24313726, 0.26666668, 1.0]  # фірмовий темно-сірий
METALLIC = 0.45
ROUGHNESS = 0.5


def recolor_glb(path):
    """Прямо в GLB-контейнері: один темний матеріал, усі примітиви на нього, прибрати COLOR_0."""
    with open(path, "rb") as f:
        data = f.read()
    assert data[:4] == b"glTF", "не GLB"
    # header: magic(4) version(4) length(4); далі чанки: len(4) type(4) data
    off = 12
    json_chunk = None
    json_start = json_end = None
    chunks = []
    while off < len(data):
        clen = struct.unpack("<I", data[off:off + 4])[0]
        ctype = data[off + 4:off + 8]
        cstart = off + 8
        cend = cstart + clen
        chunks.append((ctype, cstart, cend))
        if ctype == b"JSON":
            json_chunk = json.loads(data[cstart:cend].decode("utf-8"))
            json_start, json_end = cstart, cend
        off = cend

    g = json_chunk
    g["materials"] = [{
        "name": "TermojetDark",
        "pbrMetallicRoughness": {
            "baseColorFactor": DARK,
            "metallicFactor": METALLIC,
            "roughnessFactor": ROUGHNESS,
        },
        "doubleSided": True,
    }]
    for mesh in g.get("meshes", []):
        for prim in mesh.get("primitives", []):
            prim["material"] = 0
            attrs = prim.get("attributes", {})
            attrs.pop("COLOR_0", None)
    # текстури/семплери більше не потрібні — лишаємо як є (невикористані допустимі)

    new_json = json.dumps(g, separators=(",", ":")).encode("utf-8")
    # вирівнювання JSON-чанка до 4 байт пробілами
    pad = (4 - (len(new_json) % 4)) % 4
    new_json += b" " * pad

    # перезбираємо файл
    head = data[12:json_start - 8]  # нічого (JSON зазвичай перший), але про всяк
    out = bytearray()
    out += b"glTF"
    out += struct.pack("<I", 2)
    # тіло: JSON-чанк + решта чанків (BIN) без змін
    body = bytearray()
    body += struct.pack("<I", len(new_json)) + b"JSON" + new_json
    for ctype, cstart, cend in chunks:
        if ctype == b"JSON":
            continue
        clen = cend - cstart
        body += struct.pack("<I", clen) + ctype + data[cstart:cend]
    total = 12 + len(body)
    out += struct.pack("<I", total)
    out += body
    with open(path, "wb") as f:
        f.write(out)


def main():
    inp, outp = sys.argv[1], sys.argv[2]
    tol_lin = float(sys.argv[3]) if len(sys.argv) > 3 else 0.05
    tol_ang = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
    cascadio.step_to_glb(inp, outp, tol_linear=tol_lin, tol_angular=tol_ang,
                         merge_primitives=True, use_parallel=True)
    recolor_glb(outp)
    print(f"OK {outp} tol={tol_lin}")


if __name__ == "__main__":
    main()
