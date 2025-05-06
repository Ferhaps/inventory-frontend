import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.darkMode.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
      this.setDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      console.log(e.matches, 2);
      if (!localStorage.getItem('preferred-theme')) {
        this.setDarkMode(e.matches);
      }
    });
  }

  public setDarkMode(isDark: boolean) {
    this.darkMode.next(isDark);
    localStorage.setItem('preferred-theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  public toggleTheme() {
    this.setDarkMode(!this.darkMode.value);
  }
}
