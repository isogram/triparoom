import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import Loader from '../../../utils/loader.js';
import _ from 'lodash';
import { checkoutFlight } from '../../../actions/actionOrderFlight';
import { TIKET_ROOT_URL } from '../../../../config/api';
import { ALLOWED_PAYMENT_TYPE, ONSITE_PAYMENT_PROCESS } from '../../../../config/payment';


class FlightPayment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      onLoading: false
    }
  }

  showPassengers() {
    let allP = [];
    let passengers = this.props.order.order_detail[0].detail.passengers;
    let adult = passengers.adult;
    allP.push(adult);
    if(passengers.child) {
      allP.push(passengers.child);
    }

    if(passengers.infant) {
      allP.push(passengers.infant);
    }

    let x = 0;
    return _.map(allP, p => {
      return(
        <li key={p}>{p[x].first_name} {p[x].last_name} ({_.capitalize(p[x].type)})</li>
      );
      x++;
    });
  }

  renderPaymentOptions() {
    let x = 0;
    return _.map(this.props.order.payment_method_options, opt => {
      x++;
      if(opt.link != '#' && _.indexOf(ALLOWED_PAYMENT_TYPE, opt.type) != -1) {
        return (
          <label key={x} className="radio-inline padding-bottom-15 padding-right-10">
            <Field name="payment_method" component="input" required type="radio" value={opt.link}/>
            {opt.text}
          </label>
        );
      }
    });
  }

  renderTextField(field) {
    return (
      <div className="form-group">
        <input
          required
          type="{field.type}"
          name={field.name}
          className="form-control"
          placeholder={field.placeholder}
          {...field.input}
        />
      </div>
    );
  }

  onSubmitCheckout(values) {
    this.setState({
      onLoading: true
    });

    const token = localStorage.tiketToken;

    values.salute = this.props.order.order_detail[0].detail.passengers.adult[0].title;
    values.first_name = this.props.order.order_detail[0].detail.passengers.adult[0].first_name;
    values.last_name = this.props.order.order_detail[0].detail.passengers.adult[0].last_name;
    values.email = decodeURIComponent(this.props.contact.email).replace(/\-/g, '.');
    values.phone = this.props.contact.phone;

    const url = (values.payment_method.indexOf("?") != -1) ? `${values.payment_method}&checkouttoken=${token}` : '/process-payment';

    this.props.checkoutFlight(values, () => {
      window.location.href = url;
    });
  }

  render() {
    if(this.state.onLoading) {
      return(
        <Loader text="Please wait while your booking is processed by Tiket.com" />
      );
    }

    const { handleSubmit } = this.props;

    return(
      <div>
        <form onSubmit={handleSubmit(this.onSubmitCheckout.bind(this))}>
          <div className="booking_detail white-box animate-reveal">
            <h4>Passenger Information</h4>
            <div className="col-md-12">
              <ol className="list-group list-passenger">
                {this.showPassengers()}
              </ol>
            </div>
          </div>
          <div className="booking_detail white-box animate-reveal">
            <h4>Payment Information</h4>
            <div className="col-md-12">
            </div>
            <div className="row">
              <div className="col-md-12">
                {this.renderPaymentOptions()}
              </div>
              <div className="col-md-12">
                <label>Payment will be processed by Tiket.com</label>
              </div>
              <div className="col-md-12">
                <p><button className="btn_book" type="submit">Confirm Booking</button></p>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ checkoutFlight }, dispatch);
}

export default reduxForm({
  form: 'FlightOrder'
})(
  connect(null, mapDispatchToProps) (FlightPayment)
);