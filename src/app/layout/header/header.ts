import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type HeaderTheme = 'light' | 'dark';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Input() theme: HeaderTheme = 'light';
  @Input() overlay = false;
}
