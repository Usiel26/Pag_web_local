"""Genera ramas de ficus minimalistas (SVG) para los fondos del sitio."""
import math, sys
OUT = sys.argv[1]

# Hoja de ficus: elíptica con punta (acuminada), base en (0,0), apunta hacia -y.
LEAF = ("M0 0 C-14 -6 -30 -30 -30 -62 C-30 -94 -14 -118 0 -136 "
        "C14 -118 30 -94 30 -62 C30 -30 14 -6 0 0 Z")
VEIN = "M0 -6 L0 -120"

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    x = u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0]
    y = u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]
    dx = 3*u*u*(p1[0]-p0[0]) + 6*u*t*(p2[0]-p1[0]) + 3*t*t*(p3[0]-p2[0])
    dy = 3*u*u*(p1[1]-p0[1]) + 6*u*t*(p2[1]-p1[1]) + 3*t*t*(p3[1]-p2[1])
    return x, y, math.degrees(math.atan2(dy, dx))

def branch(w, h, curve, leaves, fill, vein, stem_w=5, scale0=1.0, scale1=0.55, spread=52, skip=0.06):
    p0, p1, p2, p3 = curve
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="none">',
             f'<path d="M{p0[0]} {p0[1]} C{p1[0]} {p1[1]} {p2[0]} {p2[1]} {p3[0]} {p3[1]}" '
             f'stroke="{fill}" stroke-width="{stem_w}" stroke-linecap="round"/>']
    for i in range(leaves):
        t = skip + (1 - skip) * i / (leaves - 1)
        x, y, ang = bez(p0, p1, p2, p3, t)
        side = -1 if i % 2 else 1
        if i == leaves - 1:
            rot, side_off = ang + 90, 0       # hoja terminal sigue la rama
        else:
            rot, side_off = ang + 90 + side * spread, side
        s = scale0 + (scale1 - scale0) * t
        g = f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.1f}) scale({s:.3f})">'
        g += f'<path d="M0 0 L0 -14" stroke="{fill}" stroke-width="5" stroke-linecap="round"/>'
        g += f'<g transform="translate(0 -12)"><path d="{LEAF}" fill="{fill}"/>'
        g += f'<path d="{VEIN}" stroke="{vein}" stroke-width="3" stroke-linecap="round"/></g></g>'
        parts.append(g)
    parts.append('</svg>')
    return "".join(parts)

def write(name, svg):
    open(f"{OUT}/{name}", "w").write(svg)

# Rama larga que entra desde abajo a la izquierda (fondo claro)
write("ficus-rama-clara.svg", branch(
    520, 640, [(40, 640), (60, 470), (250, 380), (300, 120)], 11,
    fill="#e3e9dd", vein="#f4f6f1"))


# Rama grande para la sección verde de reserva
write("ficus-rama-verde.svg", branch(
    640, 760, [(-10, 760), (90, 560), (360, 470), (420, 140)], 12,
    fill="#36553a", vein="#2f4a2c", scale0=1.25, scale1=0.7, stem_w=6))


# ---------- Árbol de ficus: tronco + ramas con hojas ----------
def branch_parts(curve, leaves, fill, vein, stem_w, scale0, scale1, spread=52, skip=0.12):
    full = branch(1, 1, curve, leaves, fill, vein, stem_w, scale0, scale1, spread, skip)
    return full[full.index('>') + 1: full.rindex('</svg>')]

def tree(fill, vein):
    W, H = 640, 820
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 0 {W + 100} {H}" fill="none">']
    # tronco con leve curva, más ancho en la base
    parts.append(f'<path d="M296 820 C300 700 290 610 318 500 L332 500 C312 610 326 700 334 820 Z" fill="{fill}"/>')
    ramas = [
        # (curva, nº hojas, escala inicial, escala final, inicio de hojas)
        ([(322, 520), (250, 480), (170, 430), (60, 330)], 6, 0.9, 0.62, 0.38),
        ([(324, 505), (305, 400), (330, 280), (310, 50)], 7, 0.9, 0.6, 0.42),
        ([(326, 520), (400, 480), (480, 420), (590, 320)], 6, 0.9, 0.62, 0.38),
        ([(316, 455), (270, 390), (210, 300), (165, 180)], 5, 0.8, 0.58, 0.45),
        ([(317, 445), (385, 380), (440, 300), (470, 170)], 5, 0.8, 0.58, 0.45),
    ]
    for curve, n, s0, s1, sk in ramas:
        parts.append(branch_parts(curve, n, fill, vein, 6, s0, s1, skip=sk))
    parts.append('</svg>')
    return "".join(parts)

write("ficus-arbol.svg", tree("#d3dacd", "#e2e6de"))
