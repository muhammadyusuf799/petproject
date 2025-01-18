FROM python:3.10.16-slim

RUN mkdir /app

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --upgrade pip

COPY requirements.txt /app/

RUN pip install -r requirements.txt


COPY . /app/

EXPOSE 8000

CMD [ "gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "petproject.wsgi:application" ]