from pathlib import Path

from pydantic_settings import BaseSettings


class ZooSettings(BaseSettings):
    panda_core_path: Path = Path("../PANDA_CORE")
    host: str = "127.0.0.1"
    port: int = 8742
    open_browser: bool = True

    class Config:
        env_prefix = "ZOO_"
