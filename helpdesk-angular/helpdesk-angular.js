/*global require*/
/*
 * Bootstrap and angular-based mashup
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};

require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources",

		 paths: {
		 	helpdeskApp : "/extensions/helpdesk-angular/helpdesk-angular"
		 }

} );


require( ["js/qlik"], function ( qlik ) {
	//qlik app
	var app;
	//data for case listing
	var data = {
		headers: [],
		rows: []
	};


	function getQlikApp () {
		return qlik.openApp( "Helpdesk Management.qvf", config )
	}
	
	
	// MODULE
	var helpdeskApp = angular.module( "helpdeskApp", ['ui.router'] );
	
	// ROUTES with UI-Router

	 helpdeskApp.config(function( $stateProvider, $urlRouterProvider) {

	 	$urlRouterProvider.otherwise('/home');

	    $stateProvider

	        //HOME STATES AND NESTED VIEWS ========================================
	        .state('home', {
	            url: '/home',
	            templateUrl: 'pages/home.html',
	            controller: "MainCtrl",
	            controllerAs: "mainController"

	        })
		    // nested list with custom controller
		    .state('cases-2', {
		        url: '/cases-2',
				views: {

		            // the main template will be placed here (relatively named)
		            '': { templateUrl: 'pages/cases-2.html' },

		            // the child views will be defined here (absolutely named)
		            'columnOne@cases-2': {
		            	url: 'charts/sales', 
		            	templateUrl: 'charts/sales.html',
		            	controller: 'SalesCtrl' 
		            },

		            // for column two, we'll define a separate controller 
		            'columnTwo@cases-2': { 
		            	url: 'charts/cases',
		                templateUrl: 'charts/cases.html',
		                controller: 'CaseCtrl'
		            }
		        }

		    })

	        .state( 'cases', {
	        	url: '/cases',
	 			templateUrl: 'pages/cases.html',
	 			controller: 'CaseCtrl',
	 			controllerAs: "casesController"
			
	 		})
	 		.state( 'additional-services',{
	 			url: '/additional-services', 
	 			templateUrl : 'pages/additional-services.html',
	 			controller: 'ServicesCtrl',
	 			controllerAs: 'ServicesController'

	 		})

	 } );



	// CONTROLLERS
	// Controller com data direito da Qlik Engine
	helpdeskApp.controller( "MainCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		//get objects -- inserted here --

		app.getObject( 'QV00', 'CurrentSelections' ).then(function ( obj1 ) {
			//console.log( obj1  );
		});
		app.getObject( 'QV01', 'hRZaKk' );
		app.getObject( 'QV02', 'xfvKMP' );
		app.getObject( 'QV03', 'a5e0f12c-38f5-4da9-8f3f-0e4566b28398' );
		app.getObject( 'QV04', 'PAppmU' );


	}] );

	helpdeskApp.controller( "SalesCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}

		//get objects -- inserted here --
		app.createCube({
		"qInitialDataFetch": [
			{
				"qHeight": 20,
				"qWidth": 2
			}
		],
		"qDimensions": [
			{
				"qLabel": "Department",
				"qLibraryId": "RBBKJP",
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			}
		],
		"qMeasures": [
			{
				"qLabel": "Open Cases",
				"qLibraryId": "MPcQeZ",
				"qSortBy": {
					"qSortByState": 0,
					"qSortByFrequency": 0,
					"qSortByNumeric": 0,
					"qSortByAscii": 1,
					"qSortByLoadOrder": 0,
					"qSortByExpression": 0,
					"qExpression": {
						"qv": " "
					}
				}
			}
		],
		"qSuppressZero": false,
		"qSuppressMissing": false,
		"qMode": "S",
		"qInterColumnSortOrder": [],
		"qStateName": "$"
		},function( reply, app ){

			openCasesDeptChart(reply, 'test-hypercube');

		});





	}] );


	// Controller com data de um Hypercube, e data direito do Qlik Engine.
	helpdeskApp.controller( "CaseCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		//get objects -- inserted here --
		app.getObject( 'QV00', 'CurrentSelections' );
		app.getObject( 'QV04', 'PAppmU' );
	    app.getObject( 'QV01', 'hRZaKk' );


		app.createCube( {
			"qInitialDataFetch": [
				{
					"qHeight": 400,
					"qWidth": 6
				}
			],
			"qDimensions": [
				{
					"qDef": {"qFieldDefs": ["CaseNumber"]}
				},
				{
					"qDef": {"qFieldDefs": ["Status"]}
				},
				{
					"qDef": {"qFieldDefs": ["Priority"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Duration Time"]}
				},
				{
					"qDef": {"qFieldDefs": ["Case Owner"]}
				},
				{
					"qDef": {"qFieldDefs": ["Subject"]}
				}
			],
			"qMeasures": [],
			"qSuppressZero": false,
			"qSuppressMissing": false,
			"qMode": "S"
		}, setCases );
		//set up scope headers and rows
		$scope.headers = data.headers;
		$scope.rows = data.rows;


		app.createCube({
		"qInitialDataFetch": [
			{
				"qHeight": 20,
				"qWidth": 2
			}
		],
		"qDimensions": [
			{
				"qLabel": "%CaseId",
				"qLibraryId": "sEavA",
				"qNullSuppression": true,
				"qOtherTotalSpec": {
					"qOtherMode": "OTHER_OFF",
					"qSuppressOther": true,
					"qOtherSortMode": "OTHER_SORT_DESCENDING",
					"qOtherCounted": {
						"qv": "5"
					},
					"qOtherLimitMode": "OTHER_GE_LIMIT"
				}
			}
		],
		"qMeasures": [
			{
				"qLabel": "Case Duration (dd hh:mm)",
				"qLibraryId": "emtEjp",
				"qSortBy": {
					"qSortByState": 0,
					"qSortByFrequency": 0,
					"qSortByNumeric": 0,
					"qSortByAscii": 1,
					"qSortByLoadOrder": 0,
					"qSortByExpression": 0,
					"qExpression": {
						"qv": " "
					}
				}
			}
		],
		"qSuppressZero": false,
		"qSuppressMissing": false,
		"qMode": "S",
		"qInterColumnSortOrder": [],
		"qStateName": "$"
		},function( reply, app ){

			caseDurationChart(reply, 'qv02-hypercube');

		});


	}] );

	// Controller de terceira pagina
	helpdeskApp.controller( "ServicesCtrl", ['$scope', function ( $scope ) {
		if ( !app ) {
			app = getQlikApp();
		}
		//get objects -- inserted here --
		    app.getObject( 'QV00', 'CurrentSelections' );
	    	app.getObject( 'QV02', '298bbd6d-f23d-4469-94a2-df243d680e0c' );
	    	app.getObject( 'QV05', 'rJFbvG' );


	}] );


	// bootstrap my angular application, including the "qlik-angular" module
	// must be done before the Qlik Sense API is used
	// you must also set qva-bootstrap="false" in your html file
	
	require(["angular", "helpdeskApp"], function (angular) {
    	angular.bootstrap( document, ["helpdeskApp", "qlik-angular"] );
  	});


	qlik.setOnError( function ( error ) {
		$( "#errmsg" ).html( error.message ).parent().show();
	} );



	//callbacks -- inserted here --
	function setCases ( reply, app ) {
		data.headers.length = 0;
		data.rows.length = 0;
		//set headers
		reply.qHyperCube.qDimensionInfo.forEach( function ( dim ) {
			data.headers.push( dim.qFallbackTitle );
		} );
		reply.qHyperCube.qMeasureInfo.forEach( function ( mea ) {
			data.headers.push( mea.qFallbackTitle );
		} );
		reply.qHyperCube.qDataPages.forEach( function ( page ) {
			page.qMatrix.forEach( function ( row ) {
				data.rows.push( row );
			} );
		} );
	}

	function openCasesDeptChart (reply, htmlId ) {
		//console.log(reply);

		var matrix = reply.qHyperCube.qDataPages[0].qMatrix;
        
		//console.log(matrix);

        if(!htmlId || !reply) {
            throw new Error("You must provide two parameters");
        }


       var dimensions = [];
       var measures = [];

        //loop to fetch data from Matrix
        for(let i = 0; i < matrix.length; i++) {
           
           let dimension = matrix[i][0].qText;
           let measure = matrix[i][1].qNum;
           
           dimensions.push(dimension);
           measures.push(measure);
       	}
    

		// echart Code 

		var myChart = echarts.init(document.getElementById(htmlId));

		//console.log(myChart);

        // specify chart configuration item and data
        var option = {
            title: {
                text: 'Open Cases By Department',
                textStyle: {
            		color: '#ccc'
       			}
            },
            tooltip: {},
            legend: {
                data:['Sales']
            },
            xAxis: {
                data: dimensions,
           		axisLabel: {
            		textStyle: {
                		color: '#ccc'
            		}
        		},
            },
            yAxis: {
           		axisLabel: {
            		textStyle: {
                		color: '#BC64D7',
                		fontWeight: 'bold'
            		}
        		},           	
            },
            series: [{
                name: reply.qHyperCube.qMeasureInfo[0].qFallbackTitle,
                type: 'bar',
                itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#83bff6'},
                            {offset: 0.1, color: '#188df0'},
                            {offset: 1, color: '#BC64D7'}
                        ]
                    )
                },
                emphasis: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#2378f7'},
                            {offset: 0.5, color: '#2378f7'},
                            {offset: 1, color: '#83bff6'}
                        ]
                    )
                }
            },
                data: measures
            }]
        };
        // use configuration item and data specified to show chart
        myChart.setOption(option);

		// end echart Code 


	}


	function caseDurationChart (reply, htmlId ) {
		//console.log(reply);

        var matrix = reply.qHyperCube.qDataPages[0].qMatrix;
        //console.log(matrix)
        if(!htmlId || !reply) {
            throw new Error("You must provide two parameters");
        }

       var dimensions = [];
       var measures = [];

        //loop to fetch data from Matrix
        for(let i = 0; i < matrix.length; i++) {
           
           let dimension = matrix[i][0].qText;
           let measure = matrix[i][1].qText;
           
           dimensions.push(dimension);
           measures.push(measure);
       	}
    

		// echart Code 

		var myChart = echarts.init(document.getElementById(htmlId));

		//console.log(myChart);

        // specify chart configuration item and data
        var option = {
            title: {
                text: 'HyperCube renderizado com uma EChart',
                textStyle: {
            		color: '#ccc'
       			}
            },
            tooltip: {},
            legend: {
                data:['Sales']
            },
            xAxis: {
                data: dimensions,
           		axisLabel: {
            		textStyle: {
                		color: '#ccc'
            		}
        		},
            },
            yAxis: {
           		axisLabel: {
            		textStyle: {
                		color: '#BC64D7',
                		fontWeight: 'bold'
            		}
        		},
            },
            series: [{
                name: reply.qHyperCube.qMeasureInfo[0].qFallbackTitle,
                type: 'bar',
                itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#83bff6'},
                            {offset: 0.2, color: '#188df0'},
                            {offset: 1, color: '#BC64D7'}
                        ]
                    )
                },
                emphasis: {
                    color: new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: '#2378f7'},
                            {offset: 0.5, color: '#2378f7'},
                            {offset: 1, color: '#83bff6'}
                        ]
                    )
                }
            },
                data: measures
            }]
        };
        // use configuration item and data specified to show chart
        myChart.setOption(option);

		// end echart Code 


	}

} );