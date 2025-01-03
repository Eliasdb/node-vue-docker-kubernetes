import {
  Directive,
  EventEmitter,
  HostListener,
  Output,
  input
} from '@angular/core';

@Directive({
  selector: '[infiniteScroll]',
})
export class InfiniteScrollDirective {
  readonly isFetching = input<boolean | null>(false); // Avoid triggering while fetching
  readonly hasMore = input<boolean | null>(true); // Stop triggering when no more data
  @Output() scrolled = new EventEmitter<void>(); // Notify when the bottom is reached

  @HostListener('scroll', ['$event.target'])
  onScroll(container: HTMLElement): void {
    const nearBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 50;

    if (nearBottom && this.hasMore() && !this.isFetching()) {
      this.scrolled.emit();
    }
  }
}
