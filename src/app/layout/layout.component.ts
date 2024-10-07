import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { HeaderComponent } from './header/header.component';
import { SideabrComponent } from "./sidebar/sidebar.component";

@Component({
  selector: 'layout',
  templateUrl: 'layout.component.html',
  styleUrls: [ 'layout.component.scss' ],
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    SideabrComponent
  ]
})
export class LayoutComponent { }