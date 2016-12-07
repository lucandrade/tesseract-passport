import ScanPassport from './ScanPassport';

const url = process.argv.length > 2 ? process.argv[2] : false;

if (!url) {
    console.error('You must inform the url');
    process.exit(0);
} else {
    const scanner = new ScanPassport();
    scanner.scan(url)
        .then(result => {
            console.log('result');
            console.log(result);
            process.exit(0);
        })
        .catch(err => {
            console.log('error');
            console.log(err);
            process.exit(0);
        });
}
