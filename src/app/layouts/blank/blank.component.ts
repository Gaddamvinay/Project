import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: []
})
export class AppBlankComponent {

  mobileQuery: MediaQueryList;
  constructor(
    media: MediaMatcher,
    changeDetectorRef: ChangeDetectorRef,
  ){
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
	  this.mobileQuery.addListener(this._mobileQueryListener);
  }
  private _mobileQueryListener: () => void;
}
