#!/usr/bin/env python3
"""Regroupe les feuilles de style dans css/site.min.css, le seul fichier chargé par les pages.
A relancer après toute modification d'un fichier de css/ : python3 outils/construire-css.py"""
import os
import re

ICI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDRE = ["tokens", "base", "components", "pages", "v8"]


def reduire(css):
    gardes = []

    def garder(m):
        if m.group(0).startswith("/*"):
            return ""
        gardes.append(m.group(0))
        return "\0%d\0" % (len(gardes) - 1)

    css = re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|/\*.*?\*/', garder, css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};,])\s*", r"\1", css)
    css = re.sub(r"([{;][-\w]+):\s+", r"\1:", css)
    css = css.replace(";}", "}")
    return re.sub(r"\0(\d+)\0", lambda m: gardes[int(m.group(1))], css).strip()


sortie = "/* Fichier généré par outils/construire-css.py, ne pas modifier à la main */\n"
sortie += "\n".join(reduire(open(os.path.join(ICI, "css", n + ".css"), encoding="utf-8").read()) for n in ORDRE) + "\n"
open(os.path.join(ICI, "css", "site.min.css"), "w", encoding="utf-8").write(sortie)
print("css/site.min.css :", len(sortie.encode()) // 1024, "Ko")
