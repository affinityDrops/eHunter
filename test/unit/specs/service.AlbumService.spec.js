import { AlbumServiceImpl } from '../../../src/platform/eh/service/AlbumServiceImpl';
import { AlbumCacheService } from '../../../src/platform/eh/service/AlbumCacheService';
import * as tags from '../../../core/assets/value/tags';

describe('service.AlbumService', () => {
    let as;
    before(async function () {
        this.timeout(10000);
        let timer = setTimeout(() => console.error('Cannot connect to e-hentai'), 9500);
        let html = await (await window.fetch('https://e-hentai.org/s/0bb62690b8/1183176-1')).text();
        window.clearTimeout(timer);
        as = new AlbumServiceImpl(html);
    });
    it('getPageCount', async () => {
        expect(await as.getPageCount()).to.be.equals(284);
    });
    // it('getPageCount', async () => {
    //     expect(await as.getBookScreenCount(2)).to.be.equals(143);
    // });
    it('getIntroUrl', () => {
        // See the commit 6356a565. I don't know why exactly.
        expect(as.getIntroUrl()).to.be.equals('/g/1183176/e6c9e01507/');
    });
    it('setIntroUrl', () => {
        as.setIntroUrl('/123/');
        expect(as.getIntroUrl()).to.be.equals('/123/');
        as.setIntroUrl('https://e-hentai.org/g/1183176/e6c9e01507/');
    });
    it('getAlbumId', async () => {
        expect(await as.getAlbumId()).to.be.equals('1183176');
    });
    it('getCurPageNum', async () => {
        expect(await as.getCurPageNum()).to.be.equals(1);
    });
    it('getTitle', async () => {
        expect(await as.getTitle()).to.be.equals('The Secret of Mobile Suit Development II U.C.0079');
    });
    it('getCacheService', () => {
        expect(as.getCacheService()).to.be.an.instanceof(AlbumCacheService);
    });
    it('getImgPageInfos', async function () {
        this.timeout(10000);
        let imgInfos = await as.getImgPageInfos();
        expect(imgInfos).to.have.lengthOf(await as.getPageCount());
        imgInfos.slice(0, 2).forEach((i) => {
            expect(i).to.have.property('pageUrl').which.is.a('string').and.not.empty;
            expect(i).to.have.property('src').which.is.a('string');
            expect(i).to.have.property('thumbHeight').which.is.a('number').and.above(0);
            expect(i).to.have.property('thumbWidth').which.is.a('number').and.above(0);
            expect(i).to.have.property('heightOfWidth').which.is.a('number').and.above(0);
        });
    });
    it('getImgPageInfo', async () => {
        for (let i = 0; i < 2; i++) {
            let imgInfo = await as.getImgPageInfo(i);
            expect(imgInfo).to.have.property('pageUrl').which.is.a('string').and.not.empty;
            expect(imgInfo).to.have.property('src').which.is.a('string');
            expect(imgInfo).to.have.property('thumbHeight').which.is.a('number').and.above(0);
            expect(imgInfo).to.have.property('thumbWidth').which.is.a('number').and.above(0);
            expect(imgInfo).to.have.property('heightOfWidth').which.is.a('number').and.above(0);
        }
    });
    it('getImgSrc', async function () {
        this.timeout(10000);
        expect(await as.getImgSrc(0)).to.match(/\.(jpg|png|gif|webp)$/);
        expect(await as.getImgSrc(1, tags.MODE_ORIGIN)).to.match(/^https:\/\/e-hentai.org\/fullimg\.php/);
        expect(await as.getImgSrc(2, tags.MODE_CHANGE_SOURCE)).to.match(/\.(jpg|png|gif|webp)$/);
    });
    it('getNewImgSrc', async function () {
        this.timeout(10000);
        let oldSrc = await as.getImgSrc(0);
        expect(await as.getNewImgSrc(0, tags.MODE_CHANGE_SOURCE))
            .to.match(/\.(jpg|png|gif|webp)$/)
            .and.not.equal(oldSrc);
    });
    it('getThumbInfos', async function () {
        this.timeout(10000);
        let thumbs = await as.getThumbInfos();
        expect(thumbs).to.have.lengthOf(await as.getPageCount());
        thumbs.slice(0, 2).forEach((i) => {
            expect(i).to.have.property('url').which.is.a('string').and.not.empty;
            expect(i).to.have.property('offset').which.is.a('number').and.least(0);
        });
        thumbs = await as.getThumbInfos(false);
        expect(thumbs).to.have.lengthOf(await as.getPageCount());
        thumbs.slice(0, 2).forEach((i) => {
            expect(i).to.have.property('url').which.is.a('string').and.not.empty;
            expect(i).to.have.property('offset').which.is.a('number').and.least(0);
        });
    });
    it('getThumbInfo', async function () {
        this.timeout(10000);
        let thumb = await as.getThumbInfo(0);
        expect(thumb).to.have.property('url').which.is.a('string').and.not.empty;
        expect(thumb).to.have.property('offset').which.is.a('number').and.least(0);
    });
    it('getPreviewThumbnailStyle', async function () {
        let style = await as.getPreviewThumbnailStyle(1, await as.getImgPageInfo(1), await as.getThumbInfo(1));
        expect(style)
            .to.have.property('background-image')
            .which.match(/url\(.+\.(jpg|png|gif|webp)\)$/);
        expect(style)
            .to.have.property('background-position')
            .which.match(/^(\d|\.)+% \d+/);
        expect(style)
            .to.have.property('background-size')
            .which.match(/^(\d|\.)+%/);
    });
    it('getRealCurIndexInfo', async function () {
        expect(as.getRealCurIndexInfo({ val: 0, updater: tags.SCROLL_VIEW })).to.have.property('val', 0);
        expect(as.getRealCurIndexInfo({ val: as.getPageCount() - 2, updater: tags.SCROLL_VIEW })).to.have.property(
            'val',
            as.getPageCount() - 2
        );
        expect(as.getRealCurIndexInfo({ val: as.getPageCount(), updater: tags.SCROLL_VIEW })).to.have.property(
            'val',
            as.getPageCount() - 1
        );
    });
});
