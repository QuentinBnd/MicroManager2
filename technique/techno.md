# Technologies utilisées pour µManager

## Frontend
- **Framework** : React
- **CSS Library** : TailwindCSS (ou autre selon besoin)
- **State Management** : Redux (ou Context API si besoin simple)

## Backend
- **Framework** : Flask (avec Flask-RESTful ou Flask-Smorest pour API-first)
- **Base de Données** : MariaDB
- **ORM** : SQLAlchemy (ou autre)
- **Authentication** : Flask-JWT-Extended (gestion des tokens JWT)

## Documentation
- **API Documentation** : Swagger/OpenAPI
- **Bibliothèques Swagger** :
  - Flask-Smorest (compatible OpenAPI)
  - Flasgger (Swagger pour Flask)

## Tests
- **Backend** : Pytest
- **Frontend** : Jest ou Testing Library
- **API Testing** : Postman ou Newman (version CLI pour automatisation)

## Déploiement
- **Containerisation** : Docker (avec docker-compose pour orchestrer les services)
- **CI/CD** : GitHub Actions ou GitLab CI/CD
- **Hébergement** : AWS, DigitalOcean, ou autre plateforme cloud

## Outils Supplémentaires
- **Visualisation de la base de données** : phpMyAdmin (MariaDB)
- **Gestion de projet** : Trello, Notion, ou autre outil collaboratif
- **Monitoring (plus tard)** : Grafana, Prometheus
