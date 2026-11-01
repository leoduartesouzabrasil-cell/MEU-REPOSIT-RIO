"""Baixa uma imagem de fonte confiável e de uso livre, registrando autor, licença e origem.

Uso:
    python3 pesquisa/baixar_imagem.py <url-da-pagina-da-foto> <tema> [nome]

Exemplo:
    python3 pesquisa/baixar_imagem.py \
        https://agenciabrasil.ebc.com.br/foto/2026-10/lula-durante-ato-de-campanha-na-ceilandia-1791559642 \
        lula ceilandia

Salva em midia/<tema>/<nome>.jpg e acrescenta uma linha em midia/<tema>/CREDITOS.md.
Só aceita domínios da lista FONTES abaixo (imagens com licença que permite reuso com crédito).
"""
import html
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

UA = "ConstrutivismoTropical/1.0 (https://github.com/leoduartesouzabrasil-cell/MEU-REPOSIT-RIO)"
RAIZ = Path(__file__).resolve().parent.parent

# domínio -> licença padrão das fotos (sempre conferir na página)
FONTES = {
    "agenciabrasil.ebc.com.br": "CC BY 3.0 BR (Agência Brasil)",
    "commons.wikimedia.org": "ver licença do arquivo no Wikimedia Commons",
    "www12.senado.leg.br": "uso livre com crédito (Agência Senado)",
    "www.camara.leg.br": "uso livre com crédito (Agência Câmara)",
}


def baixar(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def meta(pagina, nome):
    m = re.search(rf'<meta[^>]+(?:property|name)="{re.escape(nome)}"[^>]+content="([^"]+)"', pagina)
    return html.unescape(m.group(1)) if m else None


def imagem_commons(url):
    """Wikimedia Commons: usa a API para pegar o arquivo original e a licença real."""
    titulo = urllib.parse.unquote(url.split("/wiki/")[1])
    api = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo"
           "&iiprop=url|extmetadata&titles=" + urllib.parse.quote(titulo))
    pagina = next(iter(json.loads(baixar(api))["query"]["pages"].values()))
    info = pagina["imageinfo"][0]
    em = info["extmetadata"]
    limpar = lambda k: re.sub("<[^>]+>", "", em.get(k, {}).get("value", "")).strip()
    return info["url"], limpar("ImageDescription")[:300], limpar("Artist"), limpar("LicenseShortName")


def imagem_pagina(url, dominio):
    pagina = baixar(url).decode("utf-8", "replace")
    og = meta(pagina, "og:image")
    if not og:
        sys.exit("Não achei a imagem (og:image) nessa página.")
    # a Agência Brasil não libera o original; o og:image é um recorte 1600x800.
    # Preferimos a maior versão "LARGURAx0" do mesmo arquivo, que mantém a proporção original.
    arquivo = re.search(r"/(https?://[^?]+)", og)
    inteiras = []
    if arquivo:
        for m in re.finditer(r'https://imagens\.ebc\.com\.br/[^"/]+=/(\d+)x0/(?:smart/)?' + re.escape(arquivo.group(1)) + r'[^"]*', pagina):
            inteiras.append((int(m.group(1)), html.unescape(m.group(0))))
    img = max(inteiras)[1] if inteiras else og
    desc = meta(pagina, "description") or meta(pagina, "og:title") or ""
    # crédito: "Foto: ..." na descrição (páginas de foto) ou "© ..." na legenda (matérias)
    autor = re.search(r"Foto:\s*([^.\n]+)", desc) or re.search(r"<figcaption[^>]*>[^<]*?©\s*([^<]+)</figcaption", pagina)
    return img, desc[:300], html.unescape(autor.group(1)).strip() if autor else "", FONTES[dominio]


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    url, tema = sys.argv[1], sys.argv[2]
    dominio = urllib.parse.urlparse(url).netloc
    if dominio not in FONTES:
        sys.exit(f"Fonte não aprovada: {dominio}\nAprovadas: {', '.join(FONTES)}")

    if dominio == "commons.wikimedia.org":
        img, desc, autor, licenca = imagem_commons(url)
    else:
        img, desc, autor, licenca = imagem_pagina(url, dominio)

    pasta = RAIZ / "midia" / tema
    pasta.mkdir(parents=True, exist_ok=True)
    dados = baixar(img)
    # extensão pelo conteúdo (o servidor às vezes entrega WebP com nome .jpg)
    ext = ".webp" if dados[8:12] == b"WEBP" else ".png" if dados[:4] == b"\x89PNG" else ".jpg"
    nome = (sys.argv[3] if len(sys.argv) > 3 else Path(urllib.parse.urlparse(img).path).stem) + ext
    destino = pasta / nome
    destino.write_bytes(dados)

    creditos = pasta / "CREDITOS.md"
    if not creditos.exists():
        creditos.write_text("| Arquivo | Autor | Licença | Origem | Baixado em | Descrição |\n|---|---|---|---|---|---|\n")
    with creditos.open("a") as f:
        f.write(f"| {nome} | {autor or '?'} | {licenca} | {url} | {date.today()} | {desc.replace('|', '/')} |\n")

    print(f"{destino.relative_to(RAIZ)}  ({destino.stat().st_size // 1024} KB)")
    print(f"Crédito: {autor or '?'} — {licenca}")


if __name__ == "__main__":
    main()
