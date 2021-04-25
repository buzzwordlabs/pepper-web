# Pepper-the-digital-receptionist

Pepper is a digital receptionist that will finally put an end to pesky telemarketing calls.

## Dev Setup

1. Setup `env.sh` file. Get the envs from devs.
2. Ensure you have `ngrok` executable set, or you may install it to the system if you can as any other application. Run `yarn ngrok`. Install `ngrok` [here](https://ngrok.com/) if necessary.
3. Use ngrok http URL (append /call/api/index at the end) as webhook URL on Twilio dashboard for your number.
4. In a separate terminal window, run `yarn dev`.
5. You're good to go!
