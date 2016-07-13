let React = require('react');
let $ = require('jquery');

let Importer = React.createClass({
    getInitialState: () => ({
        processing: false,
        ignoreFirstRow: true,
        fileData: [],
        matchesFound: []
    }),
    render () {
        return(
            <div>
                <form className="form-horizontal">

                    <div className="form-group">
                        <label className="control-label">Please Select a file</label>
                        <input className="control-input" type="file" accept=".csv" onChange={this._onFileInputChange} />
                    </div>

                    <table className={"table table-condensed" + (this.state.fileData.length <= 0 ? '' : ' table-striped' )}>
                        {
                            this.state.fileData.length <= 0 ? null :
                            this.state.ignoreFirstRow ? null :
                            <thead>
                                <tr>
                                {
                                    this.state.fileData[0].map((item, key) => (
                                        <td key={key}><strong>{item}</strong></td>
                                    ))
                                }
                                </tr>
                            </thead>
                        }
                        <tbody>
                        {
                            this.state.fileData.length <= 0 ?
                                <tr>
                                    <td>No Data</td>
                                </tr>
                            :
                                this.state.fileData.map((line, key) => {
                                        if(key === 0){return true;}
                                        return (
                                            <tr key={key}>
                                            {
                                                line.map((item, k) =>(
                                                    <td key={k}>{item}</td>
                                                ))
                                            }
                                            </tr>
                                        )
                                    }
                                )
                        }
                        </tbody>
                    </table>

                    <div className="checkbox">
                        <label className="control-label">
                            <input className="control-input" type="checkbox" checked={!this.state.ignoreFirstRow ? '' : 'checked'} onChange={ () => { this.setState({ignoreFirstRow: !this.state.ignoreFirstRow }) }} /> Ignore First row (title row)
                        </label>
                    </div>
                    <br />
                    <div className="form-group">
                        <div className="col-md-4">
                            <button className={'btn btn-block ' + (this.state.fileData.length <= 0 || this.state.processing ? 'btn-default' : 'btn-primary')} disabled={this.state.fileData.length <= 0 ? 'disabled' : ''} onClick={this._submitForm}>Submit Import Data</button>
                        </div>
                        <div className="col-md-8">
                            {
                                this.state.matchesFound.length <= 0 ? null :
                                <a href="#" onClick={this._handleClickDownload}> { this.state.matchesFound.length } found, click to download</a>
                            }
                        </div>
                    </div>

                </form>
            </div>
        )
    },
    _onFileInputChange(e) {
        let file = e.target.files[0];
        let _this = this;

        if (!file) {
            this.setState({fileData: []});
            return;
        }

        let reader = new FileReader();
        reader.onload = (e) => {
            let contents = e.target.result;
            if(!contents) {
                this.setState({fileData: []});
                return;
            }

            this.setState({ fileData: this._CSVToArray( contents, ',' ) });
        };
        reader.readAsText(file);
    },

    // ref: http://stackoverflow.com/a/1293163/2343
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    _CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        let objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        let arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        let arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            let strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }

            let strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );

            } else {

                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        if(arrData[arrData.length-1].length === 1 && !arrData[arrData.length-1][0]) {
            arrData.pop()
        }

        // Return the parsed data.
        return( arrData );
    },
    _handleClickDownload(e) {
        e.preventDefault();

        let blob = new Blob(["Matches\n" + this.state.matchesFound.join('\n')], {type: "text/plain"})
        let url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download =  this.formatDate() + '-matches.txt';
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
    formatDate () {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    },
    _submitForm(e) {
        e.preventDefault();

        let postDate = [];

        let domainCleaner = /(((https?|ftps?|file):\/\/\/?|www.)|(\/$)?)/gi

        let tempArr = [];

        this.state.fileData.map((line, key) => {
            if(key === 0 && this.state.ignoreFirstRow){return true;}
            line.map((item, k) => {
                if(!item) {return true}
                item = item.replace(domainCleaner, '')
                tempArr.push(item)
            });
        });

        $.ajax({
            dataType:'json',
            //contentType:'application/json',
            method: 'POST',
            url: '/compare.php',
            data: {csv: tempArr},
            success: (xhr) => {
                this.setState({matchesFound:xhr})
            }
        })
    }
});

module.exports = Importer;
