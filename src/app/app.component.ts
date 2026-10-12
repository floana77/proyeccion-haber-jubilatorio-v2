import { Component } from '@angular/core';

import { ProyeccionComponent } from './proyeccion/proyeccion.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProyeccionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
