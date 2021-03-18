const { vorple, waitForLineInput } = require( "../utility" );

// Mock the console and store what would have been printed there
before( () => {
    browser.execute( function() {
        const errors = [];
        const logs = [];

        window.console = {
            log: msg => logs.push( msg ),
            error: msg => errors.push( msg )
        };

        window.getLastError = () => errors[ errors.length - 1 ];
        window.getLastLog = () => logs[ logs.length - 1 ];

    });
    
    waitForLineInput();
});

const getLastError = () => browser.execute( function() {
    return window.getLastError();
});

const getLastLog = () => browser.execute( function() {
    return window.getLastLog();
});

const setDebugging = state => vorple( "debug", state ? "on" : "off" );

describe( "debugging", () => {
    describe( "error", () => {
        const errorMsg = "errorTest";

        let throws = false;

        before( () => {
            setDebugging( true );

            try {
                vorple( "debug", "error", errorMsg );
            }
            catch(e) {
                throws = true;
            }
        });

        it( "prints an error message to the console", () => {
            expect( getLastError() ).to.equal( errorMsg );
        });

        it( "prints an error message on the screen", () => {
            expectElement( $( "#fatal-error" ) ).toHaveTextContaining( errorMsg );
        });

        it( "throws a JavaScript error", () => {
            expect( throws ).to.be.true;
        });

        it( "throws even when debugging is off", () => {
            setDebugging( false );

            try {
                expect( vorple( "debug", "error", errorMsg ) ).to.throw();
            }
            catch(e) {
            }
        });
    });

    describe( "log", () => {
        const logMsg = "logTest";

        before( () => {
            setDebugging( true );
            vorple( "debug", "log", logMsg );
        });

        it( "prints the log message to the console", () => {
            expect( getLastLog() ).to.equal( logMsg );
        });

        it( "prints the log message on the screen", () => {
            expectElement( $( "#output" ) ).toHaveTextContaining( logMsg );
        });

        it( "doesn't do anything when debugging is off", () => {
            const logMsg = "doNothing";

            setDebugging( false );
            vorple( "debug", "log", logMsg );
            expect( getLastLog() ).to.not.equal( logMsg );
            expect( $( "#output" ).getText() ).to.not.include( logMsg );
        });

        it( "returns the state of debugging", () => {
            setDebugging( false );
            expect( vorple( "debug", "log", logMsg ) ).to.be.false;
            setDebugging( true );
            expect( vorple( "debug", "log", logMsg ) ).to.be.true;
        });
    });

    describe( "state change", () => {
        it( "toggles state", () => {
            setDebugging( false );
            expect( vorple( "debug", "toggle" ) ).to.be.true;
            expect( vorple( "debug", "status" ) ).to.be.true;
            expect( vorple( "debug", "toggle" ) ).to.be.false;
            expect( vorple( "debug", "status" ) ).to.be.false;
        });
    });
});