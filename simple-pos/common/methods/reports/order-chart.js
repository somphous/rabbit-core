import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company';
import {Branch} from '../../../../core/imports/api/collections/branch';
import {Exchange} from '../../../../core/imports/api/collections/exchange';
import {Customer} from '../../../imports/api/collections/customer';
import {Order} from '../../../imports/api/collections/order';

export const orderChartReport = new ValidatedMethod({
    name: 'simplePos.orderChartReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);

            let data = Order.aggregate([
                {
                    $match: {
                        orderDate: {
                            $gte: moment().subtract(7, 'days').toDate(),
                            $lte: moment().toDate()
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: {$dayOfMonth: "$orderDate"},
                            month: {$month: "$orderDate"},
                            year: {$year: "$orderDate"}
                        },
                        orderDate: {$last: "$orderDate"},
                        total: {$sum: "$total"}

                    }
                },
                {
                    $sort: {orderDate: 1}
                },
                {
                    $project: {_id: 0, name: {$dateToString: {format: "%d/%m/%Y", date: "$orderDate"}}, y: "$total"}
                }
            ]);

            return data;
        }
    }
});