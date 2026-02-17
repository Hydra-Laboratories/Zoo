from pathlib import Path

from pydantic_settings import BaseSettings


class ZooSettings(BaseSettings):
    panda_core_path: Path = Path("../PANDA_CORE")
    host: str = "127.0.0.1"
    port: int = 8742
    open_browser: bool = True

    class Config:
        env_prefix = "ZOO_"

    @property
    def configs_dir(self) -> Path:
        return self.panda_core_path / "configs"


# Shared singleton — all routers must use this instance.
_settings = ZooSettings()


def get_settings() -> ZooSettings:
    return _settings
