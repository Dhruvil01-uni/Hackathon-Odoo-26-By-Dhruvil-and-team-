# Database Guidelines

## Naming

- Singular table names (or follow one convention consistently)
- snake_case for columns
- Primary key: id
- Foreign keys: <table>_id

## Constraints

- NOT NULL where appropriate
- UNIQUE for unique fields
- FOREIGN KEY for relationships

## Performance

- Index frequently searched columns
- Avoid SELECT *
- Optimize joins
