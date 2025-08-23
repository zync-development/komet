import { Input, InputContainer, InputLabel, InputWrapper } from "@components/AuthComponents";
import { useAppStore } from "@hooks/useAppStore";
import { observer } from "mobx-react-lite";

const ThemeSettingsPage = () => {
    const app = useAppStore();

    return (
        <div>
            <h2>Theme Settings</h2>
            <InputContainer marginBottom>
                <InputLabel>Background GIF URL</InputLabel>
                <InputWrapper>
                    <Input
                        type="text"
                        placeholder="Enter a URL"
                        value={app.theme.backgroundGifUrl ?? ""}
                        onChange={(e) => app.theme.setBackgroundGifUrl(e.target.value)}
                    />
                </InputWrapper>
            </InputContainer>
        </div>
    );
};

export default observer(ThemeSettingsPage);