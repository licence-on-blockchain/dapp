import {Template} from 'meteor/templating';
import {lob} from "../lib/LOB";
import {Settings} from "../lib/Settings";
import {RootContracts} from "../lib/RootContracts";
import './main.html';
import {PersistentCollections} from "../lib/PersistentCollections";
import {browserSetupOK} from "./shared/browsercheck";

Template.body.onCreated(function() {
    if (!browserSetupOK()) {
        Router.go('browsercheck');
    }
});

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
        return Settings.enableInstallation.get();
    },
    enableIssuerActions() {
        return Settings.enableIssuerActions.get();
    },
    browserCheckSucceeded() {
        return browserSetupOK();
    }
});

Meteor.startup(function() {
    if (Meteor.isClient) {
        Tracker.autorun(() => {
            TAPi18n.setLanguage(Settings.language.get()).fail((error) => {
                console.error(error)
            });
        });

        if (browserSetupOK()) {
            EthAccounts.init();
            EthBlocks.init();

            PersistentCollections.init();
            PersistentCollections.afterAllInitialisations(() => {
                for (const rootContractAddress of RootContracts.getAddresses()) {
                    lob.watchRootContract(rootContractAddress);
                }
            });
        }
    }
});