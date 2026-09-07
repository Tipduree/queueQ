import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type LineChatEvent = { type: 'message'; lineUserId: string };

type Waiter = {
  resolve: (event: LineChatEvent) => void;
  timer: ReturnType<typeof setTimeout>;
};

@Injectable()
export class LineChatEventsService {
  private readonly subject = new Subject<LineChatEvent>();
  private readonly waiters: Waiter[] = [];

  emit(event: LineChatEvent) {
    this.subject.next(event);
    for (const waiter of this.waiters.splice(0)) {
      clearTimeout(waiter.timer);
      waiter.resolve(event);
    }
  }

  stream(): Observable<LineChatEvent> {
    return this.subject.asObservable();
  }

  waitForNext(timeoutMs: number): Promise<LineChatEvent | null> {
    const clampedMs = Math.min(Math.max(timeoutMs, 1000), 28000);

    return new Promise((resolve) => {
      const waiter: Waiter = {
        resolve,
        timer: setTimeout(() => {
          const index = this.waiters.indexOf(waiter);
          if (index >= 0) {
            this.waiters.splice(index, 1);
          }
          resolve(null);
        }, clampedMs),
      };
      this.waiters.push(waiter);
    });
  }
}
