import { EthAccounts } from 'meteor/ethereum:accounts';
import { lob } from "../lib/LOB";
import {handleUnknownEthereumError} from "../lib/ErrorHandling";

const selectedSenderAccount = new ReactiveVar();
const estimatedGasConsumption = new ReactiveVar(0);

Template.send.onCreated(function() {
    EthAccounts.init();
    EthBlocks.init();

    this.getValues = function() {
        const sender = TemplateVar.getFrom(this.find('[name=sender]'), 'value');
        const issuanceID = this.find('[name=issuance]').value;
        const recipient = TemplateVar.getFrom(this.find('[name=recipient]'), 'value');
        const amount = this.find('[name=amount]').value;
        const gasPrice = TemplateVar.getFrom(this.find('.dapp-select-gas-price'), 'gasPrice');
        return {sender, issuanceID, recipient, amount, gasPrice};
    };

    this.resetErrors = function() {
        this.$('.dapp-error').removeClass('dapp-error');
    };

    this.onFormUpdate = function() {
        const {sender, issuanceID, recipient, amount} = this.getValues();

        lob.estimateGasTransferLicense("0xfD8F3a53e8445c19155d1E4d044C0A77EE6AEbef", issuanceID, sender, recipient, amount, (error, value) => {
            if (error) { handleUnknownEthereumError(error); return; }
            estimatedGasConsumption.set(value);
        });

        // Validate after the DOM has updated, because changes to one input may affect the values of other inputs
        setTimeout(() => {
            this.validate();
        }, 0);
    };

    this.validate = function(errorOnEmpty = false) {
        // TODO: Show error messages

        this.resetErrors();

        const {sender, issuanceID, recipient, amount} = this.getValues();
        let hasError = false;

        if (!web3.isAddress(sender)) {
            // Error should already be displayed by dapp_selectAccount
            hasError = true;
        }

        // TODO: Check if private key exists for account

        if (!recipient && errorOnEmpty) {
            this.$('[name=recipient]').addClass('dapp-error');
            hasError = true;
        }

        if (!web3.isAddress(recipient)) {
            hasError = true;
        }

        if (!issuanceID && errorOnEmpty) {
            this.$('[name=issuance]').addClass('dapp-error');
            hasError = true;
        }

        if (!amount && errorOnEmpty) {
            this.$('[name=amount]').addClass('dapp-error');
            hasError = true;
        }

        if (amount > lob.allWatchedIssuances.getKey(issuanceID).balance.getKey(sender).toNumber()) {
            this.$('[name=amount]').addClass('dapp-error');
            hasError = true;
        }

        return !hasError;
    };

    // TODO: Does this always pick the first account?
    selectedSenderAccount.set(EthAccounts.findOne().address);
});

Template.send.helpers({
    myAccounts: EthAccounts.find().fetch(),
    issuances() {
        return Object.values(lob.allWatchedIssuances.get()).filter((obj) => obj.balance.getKey(selectedSenderAccount.get()) > 0);
    },
    gasPrice() {
        return EthBlocks.latest.gasPrice
    },
    gasEstimate() {
        return estimatedGasConsumption.get();
    }
});

Template.send.events({
    'change select[name=sender]'(event) {
        selectedSenderAccount.set(event.currentTarget.value);
    },
    'keyup, change input'() {
        Template.instance().onFormUpdate();
    },
    'change select'() {
        Template.instance().onFormUpdate();
    },
    'click button#transfer'(event) {
        event.preventDefault();
        if (!Template.instance().validate(true)) {
            return;
        }

        const {sender, issuanceID, recipient, amount, gasPrice} = Template.instance().getValues();

        // TODO: Allow multiple license contracts here
        lob.transferLicense("0xfD8F3a53e8445c19155d1E4d044C0A77EE6AEbef", issuanceID, sender, recipient, amount, gasPrice, () => {
            console.log("Success");
        });
    }
});

Template.issuanceOption.helpers({
    balance() {
        return this.balance.getKey(selectedSenderAccount.get());
    }
});
