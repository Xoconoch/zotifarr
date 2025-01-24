FROM python:3.11-slim

WORKDIR /app

COPY ./app.py ./
COPY ./utils ./utils
COPY ./frontend ./frontend
COPY ./routes ./routes
COPY ./requirements.txt ./
COPY ./zotify ./zotify

COPY ./entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 7070

RUN mkdir ./credentials
RUN mkdir ./downloads

CMD ["./entrypoint.sh"]
