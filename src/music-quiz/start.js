const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require("@discordjs/voice");
const finish = require("./finish");

const getSongs = require("./getSongs");
const handleMessage = require("./handleMessage");
const pointText = require("./pointText");
const startPlaying = require("./startPlaying");

const stopCommand = '!stop';
const skipCommand = '!skip';

module.exports = async function (message) {
    const quiz = message.guild.quiz;
    quiz.songs = await getSongs(message);

    if (!quiz.songs || quiz.songs.length === 0) {
        if (quiz.songs && quiz.songs.length === 0) {
            await message.channel.send('Playlist contains no songs');
        }

        finish(message);

        return;
    }

    try {
        quiz.connection = joinVoiceChannel({
            channelId: quiz.voiceChannel.id,
            guildId: quiz.guild.id,
            adapterCreator: quiz.voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false
        });
        
        try {
            await entersState(quiz.connection, VoiceConnectionStatus.Ready, 10_000);
        } catch (err) {
            quiz.connection.destroy();
            console.trace(err);
            return;
        }
        
        quiz.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(quiz.connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(quiz.connection, VoiceConnectionStatus.Connecting, 5_000),
                ]); // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) { // Seems to be a real disconnect which SHOULDN'T be recovered from
                quiz.connection.destroy();
            }
        });
    } catch (e) {
        await message.channel.send('Could not join voice channel. Is it full?');
        await finish(message);

        return;
    }

    message.channel.send(`
        **Empecemos**! :headphones: :tada:
        **${quiz.songs.length}** Canciones han sido escogidas aleatoriamente  de la playlist
        tienes un minuto para adivinarlas.

        ${pointText(quiz.arguments.only)}

        Escribe \`${stopCommand}\` para detener el quiz
        Escribe \`${skipCommand}\` para pasar a la siguiente cancion

        - Jara es un Dios
    `.replace(/  +/g, ''));
    await startPlaying(message);

    quiz.messageCollector = message.channel
        .createMessageCollector((msg) => !msg.author.bot)
        .on('collect', response => handleMessage(message, response, stopCommand, skipCommand));
}