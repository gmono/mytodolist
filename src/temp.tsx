import { EventEmitter, Listener } from "events";

export class Timer {
  private emiter = new EventEmitter();
  state: "paused" | "running" | "stopped";
  timer = null;
  nowTime = 0;
  /**
   * 间隔时间 毫秒
   */
  interval = 1000;
  /**
   * 要计时多久 毫秒
   */
  allTime = -1;
  public start() {
    if (this.timer != null) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!(this.state === "running")) return;
      this.nowTime += this.interval;
      this.emiter.emit("tick", this.nowTime);
      if (this.allTime != -1 && this.nowTime >= this.allTime)
        this.stopAndInit();
    }, this.interval);
    //发出开始事件
    this.state = "running";
    this.emiter.emit("start");
  }
  /**
   * 会自动取消订阅 复位
   */
  public stopAndInit() {
    if (this.timer) {
      clearInterval(this.timer);
      let t = this.nowTime;
      this.nowTime = 0;
      this.state = "stopped";
      this.timer = null;
      this.emiter.emit("stop", t);
      this.emiter = new EventEmitter();
    }
  }
  public pause() {
    if (this.state == "running") {
      this.state = "paused";
      this.emiter.emit("pause");
    }
  }

  public resume() {
    if (this.state == "paused") {
      this.state = "running";
      this.emiter.emit("resume");
    }
  }

  public on(
    e: "start" | "pause" | "resume" | "stop" | "tick",
    listener: Listener
  ) {
    this.emiter.on(e, listener);
  }
}
