from django.db import models

# Create your models here.
class User(models.Model):
    name = models.CharField(max_length=255, default="")
    sessID = models.CharField(max_length=255, null=False, default='', unique=False)

    lastLogged = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.name

class Data(models.Model):
    fever = models.SmallIntegerField(default=0)
    sweating = models.SmallIntegerField(default=0)
    vomit = models.SmallIntegerField(default=0)
    muscle_pain = models.SmallIntegerField(default=0)
    diarrhea = models.SmallIntegerField(default=0)
    anemia = models.SmallIntegerField(default=0)

class Weights(models.Model):
    w_fever = models.FloatField()
    w_sweating = models.FloatField()
    w_vomit = models.FloatField()
    w_muscle_pain = models.FloatField()
    w_diarrhea = models.FloatField()
    w_anemia = models.FloatField()