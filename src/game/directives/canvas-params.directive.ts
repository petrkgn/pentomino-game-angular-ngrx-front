import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  inject,
  input,
  output,
} from "@angular/core";
import { Observable, tap } from "rxjs";

import { CanvasParams } from "../types/canvas-params";
import { ResizeService } from "../services/resize.service";
import { CanvasContext } from "../constants/canvas-context";
import { CanvasCtx } from "../types/canvas-ctx";
import { CanvasContextName } from "../types/canvas-context-name";

@Directive({
  selector: "[canvasParams]",
  standalone: true,
})
export class CanvasParamsDirective implements AfterViewInit {
  private readonly elRef = inject(ElementRef<HTMLCanvasElement>);
  private readonly resizeService = inject(ResizeService);

  canvasCss = input<string>("");
  context = input<CanvasContextName>(CanvasContext.DEFAULT);
  canvasParams = output<CanvasParams>();

  ngAfterViewInit() {
    this.initializeCanvasParams();
    this.handleResize().subscribe();
  }

  private handleResize(): Observable<number> {
    return this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(tap(() => this.initializeCanvasParams()));
  }

  private initializeCanvasParams(): void {
    const canvas = this.elRef.nativeElement;

    this.applyCanvasStyles(canvas);

    const ctx = this.getCanvasContext(canvas);

    const { width, height } = this.setCanvasDimensions(canvas);

    const canvasCenter = this.calculateCanvasCenter(width, height);

    const canvasParams: CanvasParams = {
      ctx,
      canvasCenter,
      width,
      height,
      canvas,
    };

    this.canvasParams.emit(canvasParams);
  }

  private applyCanvasStyles(canvas: HTMLCanvasElement): void {
    canvas.style.cssText = `${this.canvasCss()}; width: 100vw; height: 100vh;`;
  }

  private getCanvasContext(canvas: HTMLCanvasElement): CanvasCtx {
    const ctx = canvas.getContext(this.context());
    if (!ctx) {
      throw new Error("context not supported or canvas already initialized");
    }

    if (ctx instanceof CanvasRenderingContext2D) {
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.imageSmoothingEnabled = true;
    }

    return ctx as any;
  }

  private setCanvasDimensions(canvas: HTMLCanvasElement): {
    width: number;
    height: number;
  } {
    const rect = canvas.getBoundingClientRect();
    const width = (canvas.width =
      Math.round(devicePixelRatio * rect.right) -
      Math.round(devicePixelRatio * rect.left));
    const height = (canvas.height =
      Math.round(devicePixelRatio * rect.bottom) -
      Math.round(devicePixelRatio * rect.top));
    return { width, height };
  }

  private calculateCanvasCenter(
    width: number,
    height: number
  ): { x: number; y: number } {
    return {
      x: width * 0.5,
      y: height * 0.5,
    };
  }
}
