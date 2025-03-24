// PaypalCheckoutButton.js
import React from 'react';
import ReactDOM from 'react-dom';
import paypal from 'paypal-checkout';
import api from '../app/api';

const PaypalCheckoutButton = ({ amount, accommodationId, stayRange, onSuccess }) => {
  const paypalConf = {
    currency: 'EUR',
    env: 'sandbox',
    client: {
      sandbox: 'AfihGe_7MdNcdjhcIGJ3GyvdE9tZIpgw78gmzwXxYzhlRcuMTlP_Dtq5W2pdXZl0Ad0UNXsRJXpUSug5',
      production: '-- id--',
    },
    style: {
      label: 'pay',
      size: 'medium',
      shape: 'rect',
      color: 'gold',
    },
  };

  const PaypalButton = paypal.Button.driver('react', { React, ReactDOM });

  const payment = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const description = `Reserva alojamiento ${accommodationId}`;
      const response = await api.post(
        `/payments/paypal/create?amount=${amount}&currency=EUR&description=${encodeURIComponent(description)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.approvalUrl;
    } catch (err) {
      alert('Error iniciando el pago con PayPal');
      throw err;
    }
  };

  const onAuthorize = async (data, actions) => {
    try {
      const token = localStorage.getItem('jwt');

      await api.post(
        `/payments/paypal/confirm`,
        {},
        {
          params: {
            paymentId: data.paymentID,
            payerId: data.payerID,
            accommodationId,
            startDate: stayRange.startDate,
            endDate: stayRange.endDate,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Reserva confirmada y pagada correctamente');
      onSuccess();
    } catch (err) {
      alert('El pago fue exitoso pero no se pudo crear la reserva.');
    }
  };

  const onError = (error) => {
    console.error(error);
    alert('Hubo un error con el pago.');
  };

  const onCancel = () => {
    alert('Pago cancelado por el usuario');
  };

  return (
    <PaypalButton
      env={paypalConf.env}
      client={paypalConf.client}
      payment={payment}
      onAuthorize={onAuthorize}
      onCancel={onCancel}
      onError={onError}
      style={paypalConf.style}
      commit
      locale="es"
    />
  );
};

export default PaypalCheckoutButton;
