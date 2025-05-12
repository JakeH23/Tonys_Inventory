import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarAddComponent } from './pages/car-add/car-add.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CarsComponent } from './pages/cars/cars.component';
import { StatsHomeComponent } from './pages/stats-home/stats-home.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { CarEditComponent } from './pages/car-edit/car-edit.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AppMaterialModule } from './shared/app-material.module';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PartsComponent } from './pages/parts/parts.component';
import { PartAddComponent } from './pages/part-add/part-add.component';
import { PartEditComponent } from './pages/part-edit/part-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CarAddComponent,
    CarsComponent,
    StatsHomeComponent,
    CarouselComponent,
    CarEditComponent,
    PartsComponent,
    PartAddComponent,
    PartEditComponent,
    GalleryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ScrollingModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
