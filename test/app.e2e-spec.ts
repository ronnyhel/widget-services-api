import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { widgetServicesData } from './fixtures/test-data';
import { WidgetServiceDto } from '../src/widget-services/dto/widget-service.dto';
import { testingUser } from './fixtures/test-user';


const fixture = widgetServicesData;
const fixtureLength = fixture.length;

describe('WidgetServicesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testingUser)
      .expect(201);

    accessToken = response.body.accessToken;
  });

  it('/widget-services/:id findOne Unauthorized', () => {
    return request(app.getHttpServer())
      .get('/widget-services/1')
      .expect(401);
  });

  it('/widget-services/:id findOne BadRequest', () => {
    return request(app.getHttpServer())
      .get('/widget-services/-1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('/widget-services/:id findOne Ok and has the correct widgetVersions', async () => {
    const resp = await request(app.getHttpServer())
      .get('/widget-services/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    //check if the widgetVersions are the same and share the same length version
    const retrieved = resp?.body as WidgetServiceDto;
    const related = fixture.find(a => a.name === retrieved.name);
    expect(retrieved.widgetVersions).toHaveLength(related.widgetVersions.length);

  });

  it('/widget-services/:id findOne NotFound', () => {
    return request(app.getHttpServer())
      .get('/widget-services/100')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('/widget-services/:id findOne check moreVersionsExist is true', async () => {
    const relatedFixtureIndex = fixture.findIndex((a) => a.numOfVersions > 10);
    const id = relatedFixtureIndex + 1;

    const response = await request(app.getHttpServer())
      .get('/widget-services/'+id)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ orderBy: 'name', orderByDirection: 'DESC' })
      .expect(200);

    const retrieved = response.body as WidgetServiceDto;
    expect(retrieved.moreVersionsExist).toBe(true);

  });

  it('/widget-services/:id findOne check moreVersionsExist is false', async () => {
    const relatedFixtureIndex = fixture.findIndex((a) => a.numOfVersions < 10);
    const id = relatedFixtureIndex + 1;

    const response = await request(app.getHttpServer())
      .get('/widget-services/'+id)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ orderBy: 'name', orderByDirection: 'DESC' })
      .expect(200);

    const retrieved = response.body as WidgetServiceDto;
    expect(retrieved.moreVersionsExist).toBe(false);

  });

  it('/widget-services findAll Unauthorized', () => {
    return request(app.getHttpServer())
      .get('/widget-services')
      .expect(401);
  });

  it('/widget-services findAll BadRequest', () => {
    return request(app.getHttpServer())
      .get('/widget-services/-1')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: -1 })
      .expect(400);
  });

  it('/widget-services findAll Ok', () => {
    return request(app.getHttpServer())
      .get('/widget-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/widget-services findAll NotFound', () => {
    return request(app.getHttpServer())
      .get('/widget-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ searchTerm: 'Non existing text' })
      .expect(404);
  });

  it('/widget-services findAll pagination check', async () => {
    const pageSize = 3;

    const response = await request(app.getHttpServer())
      .get('/widget-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ pageSize })
      .expect(200);

    expect(response.body.totalPages).toBe(Math.ceil(fixtureLength / pageSize));
  });

  it('/widget-services findAll filter check', async () => {
    const response = await request(app.getHttpServer())
      .get('/widget-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ searchTerm: 'test' })
      .expect(200);

    const retrieved = response?.body?.data as WidgetServiceDto[];
    const related = fixture.filter(a =>
      a.name.toLowerCase() === a.name.toLocaleString() || a.description.toLowerCase() === a.description.toLocaleString());

    expect(retrieved).toHaveLength(related.length);
  });

  it('/widget-services findAll ordering check', async () => {
    const response = await request(app.getHttpServer())
      .get('/widget-services')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ orderBy: 'name', orderByDirection: 'DESC' })
      .expect(200);

    const retrieved = response.body.data as WidgetServiceDto[];
    const nameArray = retrieved.map(a => a.name);
    //check if the nameArray are in descending order
    expect(nameArray).toEqual(nameArray.sort().reverse());
  });

});
