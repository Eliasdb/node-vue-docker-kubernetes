import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TilesModule } from 'carbon-components-angular';
import { UiIconButtonComponent } from '../buttons/icon-button/icon-button.component';
import { UiTagComponent } from '../tag/tag.component';

interface Tag {
  type:
    | 'red'
    | 'magenta'
    | 'purple'
    | 'blue'
    | 'cyan'
    | 'teal'
    | 'green'
    | 'gray'
    | 'cool-gray'
    | 'warm-gray'
    | 'high-contrast'
    | 'outline';
  label: string;
  icon?: string;
  skeleton?: boolean;
  size?: 'sm' | 'md';
}

@Component({
  standalone: true,
  selector: 'ui-tile',
  imports: [TilesModule, UiTagComponent, UiIconButtonComponent, CommonModule],
  template: `
    <cds-clickable-tile class="ui-tile">
      <div class="tile-header">
        <h3 class="tile-title">{{ title }}</h3>
        <p class="tile-description">{{ description }}</p>
      </div>
      <div class="tile-footer">
        <div class="tile-tags">
          <ui-tag
            *ngFor="let tag of tags"
            [type]="tag.type || 'gray'"
            [label]="tag.label"
            [icon]="tag.icon"
            [size]="tag.size || 'md'"
          ></ui-tag>
        </div>

        <ui-icon-button
          buttonId="subscribe-btn"
          [size]="'md'"
          [icon]="'faDownload'"
          [iconSize]="'16px'"
          [iconColor]="'#ffffff'"
          [description]="'Subscribe'"
          (click)="onSubscribeClick()"
        ></ui-icon-button>
      </div>
    </cds-clickable-tile>
  `,
  styleUrls: ['tile.component.scss'],
})
export class UiTileComponent {
  @Input() title!: string;
  @Input() description!: string;
  @Input() tags: Tag[] = [];

  onSubscribeClick() {
    alert('Subscribed!');
  }
}