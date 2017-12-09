import { Template } from 'meteor/templating';
import { lob } from "../lib/LOB";
import { Settings } from "../lib/Settings";
import { rootContractAddresses } from "../lib/RootContracts";
import './main.html';

Router.route('/', function () {
    this.render('licenses');
});

Router.route('/licenses');

// Transfer
Router.route('/transfer');
Router.route('/transfer/from/:from/licenseContract/:licenseContract/issuance/:issuance', function () {
    this.render('transfer', {
        data: {
            licenseContract: this.params.licenseContract,
            issuanceID: this.params.issuance,
            from: this.params.from,
        }
    });
});

// Destroy
Router.route('/destroy', function () {
    this.render('transfer', {
        data: {
            destroy: true
        }
    });
});
Router.route('/destroy/from/:from/licenseContract/:licenseContract/issuance/:issuance', function () {
    this.render('transfer', {
        data: {
            licenseContract: this.params.licenseContract,
            issuanceID: this.params.issuance,
            from: this.params.from,
            destroy: true
        }
    });
});

// Transfer and allow reclaim
Router.route('/transferreclaim', function () {
    this.render('transfer', {
        data: {
            allowReclaim: true
        }
    });
});
Router.route('/transferreclaim/from/:from/licenseContract/:licenseContract/issuance/:issuance', function () {
    this.render('transfer', {
        data: {
            licenseContract: this.params.licenseContract,
            issuanceID: this.params.issuance,
            from: this.params.from,
            allowReclaim: true
        }
    });
});

// Reclaim
Router.route('/reclaim');

// Settings
Router.route('/settings');

Router.route('/createlicensecontract');


Template.body.helpers({
    activeIfCurrentRoute(name) {
        let currentRoute;
        if (Router.current() && Router.current().route.getName()) {
            currentRoute = Router.current().route.getName();
            if (currentRoute.indexOf('.') !== -1) {
                currentRoute = currentRoute.substring(0, currentRoute.indexOf('.'));
            }
        } else {
            currentRoute = 'licenses';
        }
        return currentRoute === name ? 'active' : '';
    },
    enableInstallation() {
        return Settings.enableInstallation().get();
    }
});

Template.body.onCreated(function() {
    for (const rootContractAddress of rootContractAddresses) {
        lob.watchRootContract(rootContractAddress);
    }
});