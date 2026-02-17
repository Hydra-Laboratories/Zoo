"""FastAPI app factory."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from zoo.routers import board, deck, gantry, protocol, raw, settings

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"


def create_app() -> FastAPI:
    app = FastAPI(title="Zoo — PANDA_CORE Visualizer")
    app.include_router(deck.router)
    app.include_router(board.router)
    app.include_router(gantry.router)
    app.include_router(protocol.router)
    app.include_router(raw.router)
    app.include_router(settings.router)

    if FRONTEND_DIST.is_dir():
        app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

    return app
