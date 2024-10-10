import { NgModule } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@NgModule({
  imports: [MatIconModule],
  exports: [MatIconModule],
})
export class CustomMatIconModule {
  constructor(private reg: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.reg.addSvgIcon('logoutIcon', this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/logout.svg'));
  }
}
