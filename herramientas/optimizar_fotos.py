"""
Optimiza las fotos de un evento para la sección de testimonios.

Uso (desde la carpeta del proyecto):
    python herramientas/optimizar_fotos.py "C:/ruta/a/las/fotos" boda-maria

- Toma todas las fotos JPG, PNG, HEIC* o WebP de la carpeta indicada.
- Las gira según el celular, las reduce a 1600 px y las guarda en WebP.
- Las deja en assets/img/testimonios/<nombre>/01.webp, 02.webp, …
- Al final imprime la lista "fotos" lista para pegar en js/config.js.

Requiere Pillow:  pip install pillow
(*HEIC de iPhone requiere además:  pip install pillow-heif)
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

try:
    import pillow_heif  # opcional, para fotos .HEIC de iPhone
    pillow_heif.register_heif_opener()
except ImportError:
    pass

ANCHO_MAX = 1600
CALIDAD = 78
EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    origen = Path(sys.argv[1])
    nombre = sys.argv[2].strip().lower().replace(" ", "-")
    raiz = Path(__file__).resolve().parent.parent
    destino = raiz / "assets" / "img" / "testimonios" / nombre

    fotos = sorted(p for p in origen.iterdir() if p.suffix.lower() in EXTENSIONES)
    if not fotos:
        print(f"No encontré fotos en {origen}")
        sys.exit(1)

    destino.mkdir(parents=True, exist_ok=True)
    rutas = []
    for i, foto in enumerate(fotos, start=1):
        img = ImageOps.exif_transpose(Image.open(foto)).convert("RGB")
        img.thumbnail((ANCHO_MAX, ANCHO_MAX), Image.LANCZOS)
        salida = destino / f"{i:02d}.webp"
        img.save(salida, "WEBP", quality=CALIDAD, method=6)
        kb = salida.stat().st_size // 1024
        print(f"  {foto.name}  ->  {salida.relative_to(raiz).as_posix()}  ({kb} KB)")
        rutas.append(salida.relative_to(raiz).as_posix())

    print(f"\nListo: {len(rutas)} fotos. Pega esto en el testimonio, en js/config.js:\n")
    print("      fotos: [")
    print(",\n".join(f'        "{r}"' for r in rutas))
    print("      ]")
    print("\nLa primera foto es la grande; cambia el orden si prefieres otra.")


if __name__ == "__main__":
    main()
