function filterDate(date){

    var newFormat = [];
    var dates = date.split("-");
    var month = ["January", "February", "March", "April",
                 "May", "June", "July", "August",
                 "September", "October", "November", "December"];
    newFormat.year = dates[0];
    newFormat.month = month[dates[1]-1];
    newFormat.day = dates[2];
    return newFormat;

}