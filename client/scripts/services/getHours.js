const getDay = ( store ) => {

    // Figure out day of week
    const days = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
    const now = new Date();
    const currentDay = days[ now.getDay() ];

    function msmTo24time(msm) {
      var hour = msm / 60;
      var mins = msm % 60;

      return [hour, mins];
    }

    function msmTo12time(msm) {
      var time = msmTo24time(msm);
      var h24  = time[0];
      var h12  = (0 == h24 ? 12 : (h24 > 12 ? (h24 - 10) - 2 : h24));
      var ampm = (h24 >= 12 ? 'PM' : 'AM');

      return [h12, time[1], ampm];
    }

    // Figure out store's hours
    let storeOpenHour = store[ currentDay + '_open' ];
    let storeCloseHour = store[ currentDay + '_close' ];

    if ( storeOpenHour === null || storeOpenHour === null ) {
        console.log( 'Closed' );
    } else {
        console.log( msmTo12time( storeOpenHour ), msmTo12time( storeCloseHour ) );
    }
    // return day;
}

export default getDay;
