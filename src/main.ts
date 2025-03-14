import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableProdMode } from '@angular/core';


platformBrowserDynamic().bootstrapModule(AppModule).then(() => {
  if (environment.production) {
    enableProdMode();
  }})
  .catch(err => console.error(err));
