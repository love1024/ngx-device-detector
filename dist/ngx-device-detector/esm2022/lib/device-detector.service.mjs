// tslint:disable: variable-name
/**
 * Created by ahsanayaz on 08/11/2016.
 */
import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as Constants from './device-detector.constants';
import { ReTree } from './retree';
import * as i0 from "@angular/core";
export var DeviceType;
(function (DeviceType) {
    DeviceType["Mobile"] = "mobile";
    DeviceType["Tablet"] = "tablet";
    DeviceType["Desktop"] = "desktop";
    DeviceType["Unknown"] = "unknown";
})(DeviceType || (DeviceType = {}));
export var OrientationType;
(function (OrientationType) {
    OrientationType["Portrait"] = "portrait";
    OrientationType["Landscape"] = "landscape";
})(OrientationType || (OrientationType = {}));
const iPad = 'iPad';
export class DeviceDetectorService {
    constructor(platformId) {
        this.platformId = platformId;
        this.ua = '';
        this.userAgent = '';
        this.os = '';
        this.browser = '';
        this.device = '';
        this.os_version = '';
        this.browser_version = '';
        this.reTree = new ReTree();
        this.deviceType = '';
        this.orientation = '';
        if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
            this.userAgent = window.navigator.userAgent;
        }
        this.setDeviceInfo(this.userAgent);
    }
    /**
     * @author Ahsan Ayaz
     * @desc Sets the initial value of the device when the service is initiated.
     * This value is later accessible for usage
     */
    setDeviceInfo(ua = this.userAgent) {
        if (ua !== this.userAgent) {
            this.userAgent = ua;
        }
        const mappings = [
            { const: 'OS', prop: 'os' },
            { const: 'BROWSERS', prop: 'browser' },
            { const: 'DEVICES', prop: 'device' },
            { const: 'OS_VERSIONS', prop: 'os_version' },
        ];
        mappings.forEach(mapping => {
            this[mapping.prop] = Object.keys(Constants[mapping.const]).reduce((obj, item) => {
                if (Constants[mapping.const][item] === 'device') {
                    // hack for iOS 13 Tablet
                    if (isPlatformBrowser(this.platformId) &&
                        (!!this.reTree.test(this.userAgent, Constants.TABLETS_RE[iPad]) ||
                            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))) {
                        obj[Constants[mapping.const][item]] = iPad;
                        return Object;
                    }
                }
                obj[Constants[mapping.const][item]] = this.reTree.test(ua, Constants[`${mapping.const}_RE`][item]);
                return obj;
            }, {});
        });
        mappings.forEach(mapping => {
            this[mapping.prop] = Object.keys(Constants[mapping.const])
                .map(key => {
                return Constants[mapping.const][key];
            })
                .reduce((previousValue, currentValue) => {
                if (mapping.prop === 'device' && previousValue === Constants[mapping.const].ANDROID) {
                    // if we have the actual device found, instead of 'Android', return the actual device
                    return this[mapping.prop][currentValue] ? currentValue : previousValue;
                }
                else {
                    return previousValue === Constants[mapping.const].UNKNOWN && this[mapping.prop][currentValue]
                        ? currentValue
                        : previousValue;
                }
            }, Constants[mapping.const].UNKNOWN);
        });
        this.browser_version = '0';
        if (this.browser !== Constants.BROWSERS.UNKNOWN) {
            const re = Constants.BROWSER_VERSIONS_RE[this.browser];
            const res = this.reTree.exec(ua, re);
            if (!!res) {
                this.browser_version = res[1];
            }
        }
        if (typeof window !== 'undefined' && window.matchMedia) {
            this.orientation = window.matchMedia('(orientation: landscape)').matches
                ? OrientationType.Landscape
                : OrientationType.Portrait;
        }
        else {
            this.orientation = Constants.GENERAL.UKNOWN;
        }
        this.deviceType = this.isTablet()
            ? DeviceType.Tablet
            : this.isMobile(this.userAgent)
                ? DeviceType.Mobile
                : this.isDesktop(this.userAgent)
                    ? DeviceType.Desktop
                    : DeviceType.Unknown;
    }
    /**
     * @author Ahsan Ayaz
     * @desc Returns the device information
     * @returns the device information object.
     */
    getDeviceInfo() {
        const deviceInfo = {
            userAgent: this.userAgent,
            os: this.os,
            browser: this.browser,
            device: this.device,
            os_version: this.os_version,
            browser_version: this.browser_version,
            deviceType: this.deviceType,
            orientation: this.orientation,
        };
        return deviceInfo;
    }
    /**
     * @author Ahsan Ayaz
     * @desc Compares the current device info with the mobile devices to check
     * if the current device is a mobile and also check current device is tablet so it will return false.
     * @returns whether the current device is a mobile
     */
    isMobile(userAgent = this.userAgent) {
        if (this.isTablet(userAgent)) {
            return false;
        }
        const match = Object.keys(Constants.MOBILES_RE).find(mobile => {
            return this.reTree.test(userAgent, Constants.MOBILES_RE[mobile]);
        });
        return !!match;
    }
    /**
     * @author Ahsan Ayaz
     * @desc Compares the current device info with the tablet devices to check
     * if the current device is a tablet.
     * @returns whether the current device is a tablet
     */
    isTablet(userAgent = this.userAgent) {
        if (isPlatformBrowser(this.platformId) &&
            (!!this.reTree.test(this.userAgent, Constants.TABLETS_RE[iPad]) ||
                (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))) {
            return true;
        }
        const match = Object.keys(Constants.TABLETS_RE).find(mobile => {
            return !!this.reTree.test(userAgent, Constants.TABLETS_RE[mobile]);
        });
        return !!match;
    }
    /**
     * @author Ahsan Ayaz
     * @desc Compares the current device info with the desktop devices to check
     * if the current device is a desktop device.
     * @returns whether the current device is a desktop device
     */
    isDesktop(userAgent = this.userAgent) {
        if (this.device === Constants.DEVICES.UNKNOWN) {
            if (this.isMobile(userAgent) || this.isTablet(userAgent)) {
                return false;
            }
        }
        return Constants.DESKTOP_DEVICES.indexOf(this.device) > -1;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.2", ngImport: i0, type: DeviceDetectorService, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.2", ngImport: i0, type: DeviceDetectorService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.2", ngImport: i0, type: DeviceDetectorService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWRldGVjdG9yLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZGV2aWNlLWRldGVjdG9yL3NyYy9saWIvZGV2aWNlLWRldGVjdG9yLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZ0NBQWdDO0FBQ2hDOztHQUVHO0FBQ0gsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sS0FBSyxTQUFTLE1BQU0sNkJBQTZCLENBQUM7QUFDekQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQzs7QUFZbEMsTUFBTSxDQUFOLElBQVksVUFLWDtBQUxELFdBQVksVUFBVTtJQUNwQiwrQkFBaUIsQ0FBQTtJQUNqQiwrQkFBaUIsQ0FBQTtJQUNqQixpQ0FBbUIsQ0FBQTtJQUNuQixpQ0FBbUIsQ0FBQTtBQUNyQixDQUFDLEVBTFcsVUFBVSxLQUFWLFVBQVUsUUFLckI7QUFDRCxNQUFNLENBQU4sSUFBWSxlQUdYO0FBSEQsV0FBWSxlQUFlO0lBQ3pCLHdDQUFxQixDQUFBO0lBQ3JCLDBDQUF1QixDQUFBO0FBQ3pCLENBQUMsRUFIVyxlQUFlLEtBQWYsZUFBZSxRQUcxQjtBQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUtwQixNQUFNLE9BQU8scUJBQXFCO0lBV2hDLFlBQXlDLFVBQWU7UUFBZixlQUFVLEdBQVYsVUFBVSxDQUFLO1FBVnhELE9BQUUsR0FBRyxFQUFFLENBQUM7UUFDUixjQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ2YsT0FBRSxHQUFHLEVBQUUsQ0FBQztRQUNSLFlBQU8sR0FBRyxFQUFFLENBQUM7UUFDYixXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNo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QUVEOzs7OztPQUtHO0lBQ0ksU0FBUyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUztRQUN6QyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDN0MsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3hELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7U0FDRjtRQUNELE9BQU8sU0FBUyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7OEdBbEtVLHFCQUFxQixrQkFXWixXQUFXO2tIQVhwQixxQkFBcUIsY0FGcEIsTUFBTTs7MkZBRVAscUJBQXFCO2tCQUhqQyxVQUFVO21CQUFDO29CQUNWLFVBQVUsRUFBRSxNQUFNO2lCQUNuQjs7MEJBWWMsTUFBTTsyQkFBQyxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdHNsaW50OmRpc2FibGU6IHZhcmlhYmxlLW5hbWVcbi8qKlxuICogQ3JlYXRlZCBieSBhaHNhbmF5YXogb24gMDgvMTEvMjAxNi5cbiAqL1xuaW1wb3J0IHsgUExBVEZPUk1fSUQsIEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgaXNQbGF0Zm9ybUJyb3dzZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0ICogYXMgQ29uc3RhbnRzIGZyb20gJy4vZGV2aWNlLWRldGVjdG9yLmNvbnN0YW50cyc7XG5pbXBvcnQgeyBSZVRyZWUgfSBmcm9tICcuL3JldHJlZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV2aWNlSW5mbyB7XG4gIHVzZXJBZ2VudDogc3RyaW5nO1xuICBvczogc3RyaW5nO1xuICBicm93c2VyOiBzdHJpbmc7XG4gIGRldmljZTogc3RyaW5nO1xuICBvc192ZXJzaW9uOiBzdHJpbmc7XG4gIGJyb3dzZXJfdmVyc2lvbjogc3RyaW5nO1xuICBkZXZpY2VUeXBlOiBzdHJpbmc7XG4gIG9yaWVudGF0aW9uOiBzdHJpbmc7XG59XG5leHBvcnQgZW51bSBEZXZpY2VUeXBlIHtcbiAgTW9iaWxlID0gJ21vYmlsZScsXG4gIFRhYmxldCA9ICd0YWJsZXQnLFxuICBEZXNrdG9wID0gJ2Rlc2t0b3AnLFxuICBVbmtub3duID0gJ3Vua25vd24nLFxufVxuZXhwb3J0IGVudW0gT3JpZW50YXRpb25UeXBlIHtcbiAgUG9ydHJhaXQgPSAncG9ydHJhaXQnLFxuICBMYW5kc2NhcGUgPSAnbGFuZHNjYXBlJyxcbn1cblxuY29uc3QgaVBhZCA9ICdpUGFkJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCcsXG59KVxuZXhwb3J0IGNsYXNzIERldmljZURldGVjdG9yU2VydmljZSB7XG4gIHVhID0gJyc7XG4gIHVzZXJBZ2VudCA9ICcnO1xuICBvcyA9ICcnO1xuICBicm93c2VyID0gJyc7XG4gIGRldmljZSA9ICcnO1xuICBvc192ZXJzaW9uID0gJyc7XG4gIGJyb3dzZXJfdmVyc2lvbiA9ICcnO1xuICByZVRyZWUgPSBuZXcgUmVUcmVlKCk7XG4gIGRldmljZVR5cGUgPSAnJztcbiAgb3JpZW50YXRpb24gPSAnJztcbiAgY29uc3RydWN0b3IoQEluamVjdChQTEFURk9STV9JRCkgcHJpdmF0ZSBwbGF0Zm9ybUlkOiBhbnkpIHtcbiAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5wbGF0Zm9ybUlkKSAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy51c2VyQWdlbnQgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICB9XG4gICAgdGhpcy5zZXREZXZpY2VJbmZvKHRoaXMudXNlckFnZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAYXV0aG9yIEFoc2FuIEF5YXpcbiAgICogQGRlc2MgU2V0cyB0aGUgaW5pdGlhbCB2YWx1ZSBvZiB0aGUgZGV2aWNlIHdoZW4gdGhlIHNlcnZpY2UgaXMgaW5pdGlhdGVkLlxuICAgKiBUaGlzIHZhbHVlIGlzIGxhdGVyIGFjY2Vzc2libGUgZm9yIHVzYWdlXG4gICAqL1xuICBzZXREZXZpY2VJbmZvKHVhID0gdGhpcy51c2VyQWdlbnQpOiB2b2lkIHtcbiAgICBpZiAodWEgIT09IHRoaXMudXNlckFnZW50KSB7XG4gICAgICB0aGlzLnVzZXJBZ2VudCA9IHVhO1xuICAgIH1cbiAgICBjb25zdCBtYXBwaW5ncyA9IFtcbiAgICAgIHsgY29uc3Q6ICdPUycsIHByb3A6ICdvcycgfSxcbiAgICAgIHsgY29uc3Q6ICdCUk9XU0VSUycsIHByb3A6ICdicm93c2VyJyB9LFxuICAgICAgeyBjb25zdDogJ0RFVklDRVMnLCBwcm9wOiAnZGV2aWNlJyB9LFxuICAgICAgeyBjb25zdDogJ09TX1ZFUlNJT05TJywgcHJvcDogJ29zX3ZlcnNpb24nIH0sXG4gICAgXTtcblxuICAgIG1hcHBpbmdzLmZvckVhY2gobWFwcGluZyA9PiB7XG4gICAgICB0aGlzW21hcHBpbmcucHJvcF0gPSBPYmplY3Qua2V5cyhDb25zdGFudHNbbWFwcGluZy5jb25zdF0pLnJlZHVjZSgob2JqOiBhbnksIGl0ZW06IGFueSkgPT4ge1xuICAgICAgICBpZiAoQ29uc3RhbnRzW21hcHBpbmcuY29uc3RdW2l0ZW1dID09PSAnZGV2aWNlJykge1xuICAgICAgICAgIC8vIGhhY2sgZm9yIGlPUyAxMyBUYWJsZXRcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLnBsYXRmb3JtSWQpICYmXG4gICAgICAgICAgICAoISF0aGlzLnJlVHJlZS50ZXN0KHRoaXMudXNlckFnZW50LCBDb25zdGFudHMuVEFCTEVUU19SRVtpUGFkXSkgfHxcbiAgICAgICAgICAgICAgKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJyAmJiBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAxKSlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIG9ialtDb25zdGFudHNbbWFwcGluZy5jb25zdF1baXRlbV1dID0gaVBhZDtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9ialtDb25zdGFudHNbbWFwcGluZy5jb25zdF1baXRlbV1dID0gdGhpcy5yZVRyZWUudGVzdCh1YSwgQ29uc3RhbnRzW2Ake21hcHBpbmcuY29uc3R9X1JFYF1baXRlbV0pO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSwge30pO1xuICAgIH0pO1xuXG4gICAgbWFwcGluZ3MuZm9yRWFjaChtYXBwaW5nID0+IHtcbiAgICAgIHRoaXNbbWFwcGluZy5wcm9wXSA9IE9iamVjdC5rZXlzKENvbnN0YW50c1ttYXBwaW5nLmNvbnN0XSlcbiAgICAgICAgLm1hcChrZXkgPT4ge1xuICAgICAgICAgIHJldHVybiBDb25zdGFudHNbbWFwcGluZy5jb25zdF1ba2V5XTtcbiAgICAgICAgfSlcbiAgICAgICAgLnJlZHVjZSgocHJldmlvdXNWYWx1ZSwgY3VycmVudFZhbHVlKSA9PiB7XG4gICAgICAgICAgaWYgKG1hcHBpbmcucHJvcCA9PT0gJ2RldmljZScgJiYgcHJldmlvdXNWYWx1ZSA9PT0gQ29uc3RhbnRzW21hcHBpbmcuY29uc3RdLkFORFJPSUQpIHtcbiAgICAgICAgICAgIC8vIGlmIHdlIGhhdmUgdGhlIGFjdHVhbCBkZXZpY2UgZm91bmQsIGluc3RlYWQgb2YgJ0FuZHJvaWQnLCByZXR1cm4gdGhlIGFjdHVhbCBkZXZpY2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzW21hcHBpbmcucHJvcF1bY3VycmVudFZhbHVlXSA/IGN1cnJlbnRWYWx1ZSA6IHByZXZpb3VzVmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91c1ZhbHVlID09PSBDb25zdGFudHNbbWFwcGluZy5jb25zdF0uVU5LTk9XTiAmJiB0aGlzW21hcHBpbmcucHJvcF1bY3VycmVudFZhbHVlXVxuICAgICAgICAgICAgICA/IGN1cnJlbnRWYWx1ZVxuICAgICAgICAgICAgICA6IHByZXZpb3VzVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBDb25zdGFudHNbbWFwcGluZy5jb25zdF0uVU5LTk9XTik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmJyb3dzZXJfdmVyc2lvbiA9ICcwJztcbiAgICBpZiAodGhpcy5icm93c2VyICE9PSBDb25zdGFudHMuQlJPV1NFUlMuVU5LTk9XTikge1xuICAgICAgY29uc3QgcmUgPSBDb25zdGFudHMuQlJPV1NFUl9WRVJTSU9OU19SRVt0aGlzLmJyb3dzZXJdO1xuICAgICAgY29uc3QgcmVzID0gdGhpcy5yZVRyZWUuZXhlYyh1YSwgcmUpO1xuICAgICAgaWYgKCEhcmVzKSB7XG4gICAgICAgIHRoaXMuYnJvd3Nlcl92ZXJzaW9uID0gcmVzWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lm1hdGNoTWVkaWEpIHtcbiAgICAgIHRoaXMub3JpZW50YXRpb24gPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJykubWF0Y2hlc1xuICAgICAgICA/IE9yaWVudGF0aW9uVHlwZS5MYW5kc2NhcGVcbiAgICAgICAgOiBPcmllbnRhdGlvblR5cGUuUG9ydHJhaXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3JpZW50YXRpb24gPSBDb25zdGFudHMuR0VORVJBTC5VS05PV047XG4gICAgfVxuXG4gICAgdGhpcy5kZXZpY2VUeXBlID0gdGhpcy5pc1RhYmxldCgpXG4gICAgICA/IERldmljZVR5cGUuVGFibGV0XG4gICAgICA6IHRoaXMuaXNNb2JpbGUodGhpcy51c2VyQWdlbnQpXG4gICAgICA/IERldmljZVR5cGUuTW9iaWxlXG4gICAgICA6IHRoaXMuaXNEZXNrdG9wKHRoaXMudXNlckFnZW50KVxuICAgICAgPyBEZXZpY2VUeXBlLkRlc2t0b3BcbiAgICAgIDogRGV2aWNlVHlwZS5Vbmtub3duO1xuICB9XG5cbiAgLyoqXG4gICAqIEBhdXRob3IgQWhzYW4gQXlhelxuICAgKiBAZGVzYyBSZXR1cm5zIHRoZSBkZXZpY2UgaW5mb3JtYXRpb25cbiAgICogQHJldHVybnMgdGhlIGRldmljZSBpbmZvcm1hdGlvbiBvYmplY3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0RGV2aWNlSW5mbygpOiBEZXZpY2VJbmZvIHtcbiAgICBjb25zdCBkZXZpY2VJbmZvOiBEZXZpY2VJbmZvID0ge1xuICAgICAgdXNlckFnZW50OiB0aGlzLnVzZXJBZ2VudCxcbiAgICAgIG9zOiB0aGlzLm9zLFxuICAgICAgYnJvd3NlcjogdGhpcy5icm93c2VyLFxuICAgICAgZGV2aWNlOiB0aGlzLmRldmljZSxcbiAgICAgIG9zX3ZlcnNpb246IHRoaXMub3NfdmVyc2lvbixcbiAgICAgIGJyb3dzZXJfdmVyc2lvbjogdGhpcy5icm93c2VyX3ZlcnNpb24sXG4gICAgICBkZXZpY2VUeXBlOiB0aGlzLmRldmljZVR5cGUsXG4gICAgICBvcmllbnRhdGlvbjogdGhpcy5vcmllbnRhdGlvbixcbiAgICB9O1xuICAgIHJldHVybiBkZXZpY2VJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqIEBhdXRob3IgQWhzYW4gQXlhelxuICAgKiBAZGVzYyBDb21wYXJlcyB0aGUgY3VycmVudCBkZXZpY2UgaW5mbyB3aXRoIHRoZSBtb2JpbGUgZGV2aWNlcyB0byBjaGVja1xuICAgKiBpZiB0aGUgY3VycmVudCBkZXZpY2UgaXMgYSBtb2JpbGUgYW5kIGFsc28gY2hlY2sgY3VycmVudCBkZXZpY2UgaXMgdGFibGV0IHNvIGl0IHdpbGwgcmV0dXJuIGZhbHNlLlxuICAgKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBjdXJyZW50IGRldmljZSBpcyBhIG1vYmlsZVxuICAgKi9cbiAgcHVibGljIGlzTW9iaWxlKHVzZXJBZ2VudCA9IHRoaXMudXNlckFnZW50KTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNUYWJsZXQodXNlckFnZW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaCA9IE9iamVjdC5rZXlzKENvbnN0YW50cy5NT0JJTEVTX1JFKS5maW5kKG1vYmlsZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5yZVRyZWUudGVzdCh1c2VyQWdlbnQsIENvbnN0YW50cy5NT0JJTEVTX1JFW21vYmlsZV0pO1xuICAgIH0pO1xuICAgIHJldHVybiAhIW1hdGNoO1xuICB9XG5cbiAgLyoqXG4gICAqIEBhdXRob3IgQWhzYW4gQXlhelxuICAgKiBAZGVzYyBDb21wYXJlcyB0aGUgY3VycmVudCBkZXZpY2UgaW5mbyB3aXRoIHRoZSB0YWJsZXQgZGV2aWNlcyB0byBjaGVja1xuICAgKiBpZiB0aGUgY3VycmVudCBkZXZpY2UgaXMgYSB0YWJsZXQuXG4gICAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIGN1cnJlbnQgZGV2aWNlIGlzIGEgdGFibGV0XG4gICAqL1xuICBwdWJsaWMgaXNUYWJsZXQodXNlckFnZW50ID0gdGhpcy51c2VyQWdlbnQpOiBib29sZWFuIHtcbiAgICBpZiAoXG4gICAgICBpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLnBsYXRmb3JtSWQpICYmXG4gICAgICAoISF0aGlzLnJlVHJlZS50ZXN0KHRoaXMudXNlckFnZW50LCBDb25zdGFudHMuVEFCTEVUU19SRVtpUGFkXSkgfHxcbiAgICAgICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJyAmJiBuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAxKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaCA9IE9iamVjdC5rZXlzKENvbnN0YW50cy5UQUJMRVRTX1JFKS5maW5kKG1vYmlsZSA9PiB7XG4gICAgICByZXR1cm4gISF0aGlzLnJlVHJlZS50ZXN0KHVzZXJBZ2VudCwgQ29uc3RhbnRzLlRBQkxFVFNfUkVbbW9iaWxlXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhbWF0Y2g7XG4gIH1cblxuICAvKipcbiAgICogQGF1dGhvciBBaHNhbiBBeWF6XG4gICAqIEBkZXNjIENvbXBhcmVzIHRoZSBjdXJyZW50IGRldmljZSBpbmZvIHdpdGggdGhlIGRlc2t0b3AgZGV2aWNlcyB0byBjaGVja1xuICAgKiBpZiB0aGUgY3VycmVudCBkZXZpY2UgaXMgYSBkZXNrdG9wIGRldmljZS5cbiAgICogQHJldHVybnMgd2hldGhlciB0aGUgY3VycmVudCBkZXZpY2UgaXMgYSBkZXNrdG9wIGRldmljZVxuICAgKi9cbiAgcHVibGljIGlzRGVza3RvcCh1c2VyQWdlbnQgPSB0aGlzLnVzZXJBZ2VudCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmRldmljZSA9PT0gQ29uc3RhbnRzLkRFVklDRVMuVU5LTk9XTikge1xuICAgICAgaWYgKHRoaXMuaXNNb2JpbGUodXNlckFnZW50KSB8fCB0aGlzLmlzVGFibGV0KHVzZXJBZ2VudCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gQ29uc3RhbnRzLkRFU0tUT1BfREVWSUNFUy5pbmRleE9mKHRoaXMuZGV2aWNlKSA+IC0xO1xuICB9XG59XG4iXX0=