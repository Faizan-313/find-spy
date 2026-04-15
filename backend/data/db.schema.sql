
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE IF NOT EXISTS room (
    id                 INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    host               VARCHAR(255) NOT NULL,         -- username of the host player
    room_code          VARCHAR(32)  NOT NULL UNIQUE,
    is_voting_started  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_started         BOOLEAN      NOT NULL DEFAULT FALSE,
    is_ended           BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_room_code  ON room (room_code);
CREATE INDEX IF NOT EXISTS idx_room_host       ON room (host);
CREATE INDEX IF NOT EXISTS idx_room_is_ended   ON room (is_ended);

CREATE OR REPLACE TRIGGER set_room_updated_at
BEFORE UPDATE ON room
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


CREATE TABLE IF NOT EXISTS player (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    room_id     INTEGER      NOT NULL REFERENCES room (id) ON DELETE CASCADE,
    is_host     BOOLEAN      NOT NULL DEFAULT FALSE,
    is_spy      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (name, room_id)
);

CREATE INDEX IF NOT EXISTS idx_player_room_id ON player (room_id);

CREATE OR REPLACE TRIGGER set_player_updated_at
BEFORE UPDATE ON player
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


CREATE TABLE IF NOT EXISTS vote (
    id          INTEGER   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    voter_id    INTEGER   NOT NULL REFERENCES player (id) ON DELETE CASCADE,
    votee_id    INTEGER   NOT NULL REFERENCES player (id) ON DELETE CASCADE,
    room_id     INTEGER   NOT NULL REFERENCES room   (id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- one vote per player per room
    UNIQUE (voter_id, room_id),

    -- a player cannot vote for themselves
    CONSTRAINT no_self_vote CHECK (voter_id <> votee_id)
);

CREATE INDEX IF NOT EXISTS idx_vote_room_id   ON vote (room_id);
CREATE INDEX IF NOT EXISTS idx_vote_voter_id  ON vote (voter_id);
CREATE INDEX IF NOT EXISTS idx_vote_votee_id  ON vote (votee_id);

CREATE OR REPLACE TRIGGER set_vote_updated_at
BEFORE UPDATE ON vote
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();