import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.darkMode.asObservable();

  public setDarkMode(isDark: boolean): void {
    console.log('Setting dark mode to:', isDark);
    this.darkMode.next(isDark);
    localStorage.setItem('preferred-theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  public toggleTheme(): void {
    this.setDarkMode(!this.darkMode.value);
  }
}
