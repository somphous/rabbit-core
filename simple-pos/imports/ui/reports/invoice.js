import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {AutoForm} from 'meteor/aldeed:autoform';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import 'meteor/theara:autoprint';
import 'printthis';

// Lib
import {displaySuccess, displayError} from '../../../../core/client/libs/display-alert.js';


// Component
import '../../../../core/imports/ui/layouts/report/content.html';
import '../../../../core/imports/ui/layouts/report/sign-footer.html';
import '../../../../core/client/components/loading.js';
import '../../../../core/client/components/form-footer.js';

// Method
import {orderReport} from '../../../common/methods/reports/oreder.js';

// Schema
import {OrderSchema} from '../../api/collections/reports/order.js';

// Page
import './invoice.html';

// Declare template
let indexTmpl = Template.SimplePos_invoiceReport;


// State
let formDataState = new ReactiveVar(null);

// Form
indexTmpl.onCreated(function () {
    this.rptInitState = new ReactiveVar(false);
    this.rptDataState = new ReactiveVar(null);

    this.autorun(() => {
        // Form Filter
        let user = Meteor.user();
        if (user) {
            let rolesBranch = user.rolesBranch;
            this.subscribe('core.branch', {_id: {$in: rolesBranch}});
        }

        // Report Data
        if (formDataState.get()) {
            this.rptInitState.set(true);
            this.rptDataState.set(false);

            orderReport.callPromise(formDataState.get())
                .then((result)=> {
                    this.rptDataState.set(result);
                }).catch((err)=> {
                    console.log(err.message);
                }
            );
        }

    });
});

indexTmpl.helpers({
    schema(){
        return OrderSchema;
    },
    // Generate
    options: function () {
        // font size = null (default), bg
        // paper = a4, a5, mini
        // orientation = portrait, landscape
        return {
            //fontSize: 'bg',
            paper: 'mini',
            orientation: 'portrait'
        };
    },
    rptInit(){
        let instance = Template.instance();
        return instance.rptInitState.get();
    },
    rptData: function () {
        let instance = Template.instance();
        return instance.rptDataState.get();
    }
});

indexTmpl.events({
    'click #print-report'(event, instance){
        let opts = {
            // debug: true,               // show the iframe for debugging
            // importCSS: true,            // import page CSS
            // importStyle: true,         // import style tags
            // printContainer: true,       // grab outer container as well as the contents of the selector
            // loadCSS: "path/to/my.css",  // path to additional css file - us an array [] for multiple
            // pageTitle: "",              // add title to print page
            // removeInline: false,        // remove all inline styles from print elements
            // printDelay: 333,            // variable print delay; depending on complexity a higher value may be necessary
            // header: null,               // prefix to html
            // formValues: true            // preserve input/form values
        };

        $('#report-content').printThis(opts);
    }
});

indexTmpl.onDestroyed(function () {
    formDataState.set(null);
});

// Form hook
let hooksObject = {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();
        formDataState.set(null);

        this.done(null, insertDoc);
    },
    onSuccess: function (formType, result) {
        console.log(result);
        formDataState.set(result);
    },
    onError: function (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks('SimplePos_invoiceReport', hooksObject);
