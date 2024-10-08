import { inject, Injectable } from "@angular/core";
import { WINDOW } from "@ng-web-apis/common";
import { combineLatestWith, fromEvent, map, Observable, startWith } from "rxjs";

@Injectable({ providedIn: "root" })
export class ResizeService {
  private window = inject(WINDOW);
  private resizeEvent$ = fromEvent(window, "resize");
  private loadEvent$ = fromEvent(window, "load");

  calculateScaleRatio(
    baseCellSize: number,
    gridWidthInCells: number
  ): Observable<number> {
    return this.resizeEvent$.pipe(
      startWith(this.getWindowSize()),
      combineLatestWith(this.loadEvent$),
      map(() => this.getRatio(baseCellSize, gridWidthInCells))
    );
  }

  calculateDpr(): Observable<number> {
    return this.resizeEvent$.pipe(
      startWith(this.getWindowSize()),
      combineLatestWith(this.loadEvent$),
      map(() => this.getDpr())
    );
  }

  private getWindowSize(): { width: number; height: number } {
    return { width: this.window.innerWidth, height: this.window.innerHeight };
  }

  getRatio(baseCellSize: number, gridWidthInCells: number): number {
    const windowWidth = this.window.innerWidth;
    const desiredCanvasWidth = baseCellSize * gridWidthInCells;
    return 2;
  }

  private getDpr(): number {
    if (!this.window) return 1;
    return this.window.devicePixelRatio;
  }
}
