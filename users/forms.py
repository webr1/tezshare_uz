from django import forms


class EmailRequestForm(forms.Form):
    email = forms.EmailField(
        max_length=254,
        required=True,
        widget=forms.EmailInput(
            attrs={"placeholder": "Введите ваш email", "class": "form-control"}
        ),
    )

    def clean_email(self):
        return self.cleaned_data["email"].lower()


class OTPVerificationForm(forms.Form):
    otp = forms.CharField(
        max_length=6,
        min_length=6,
        required=True,
        widget=forms.TextInput(
            attrs={"placeholder": "000000", "class": "form-control"}
        ),
    )
